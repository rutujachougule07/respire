import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { LOGIN_ACCOUNTS } from '../components/admin/initialData';

const AuthContext = createContext(null);

// Normalize input username or email into the canonical email address
export const normalizeAdminEmail = (input) => {
  const clean = (input || '').trim().toLowerCase();
  if (clean === 'admin') return 'admin@gmail.com';
  if (clean === 'manager1') return 'manager1@gmail.com';
  if (clean === 'manager2') return 'manager2@gmail.com';
  return clean;
};

// Check if an email matches one of the 3 authorized admin accounts
export const findAuthorizedAccount = (email) => {
  const normalized = normalizeAdminEmail(email);
  return LOGIN_ACCOUNTS.find(
    (acc) => acc.email.toLowerCase() === normalized
  );
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [adminSession, setAdminSession] = useState(() => {
    try {
      const stored = localStorage.getItem('rf_admin_session_auth');
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      // Strictly verify stored session belongs to one of the 3 authorized accounts
      const matched = findAuthorizedAccount(parsed?.email);
      return matched ? { ...matched, ...parsed } : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Sync admin session to localStorage
  useEffect(() => {
    try {
      if (adminSession && findAuthorizedAccount(adminSession.email)) {
        localStorage.setItem('rf_admin_session_auth', JSON.stringify(adminSession));
      } else {
        localStorage.removeItem('rf_admin_session_auth');
      }
    } catch {
      // ignore storage errors
    }
  }, [adminSession]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const emailLower = (firebaseUser.email || '').toLowerCase();
        const matched = findAuthorizedAccount(emailLower);

        if (matched) {
          setCurrentUser(firebaseUser);
          const session = {
            ...matched,
            uid: firebaseUser.uid,
            firebaseEmail: firebaseUser.email,
          };
          setAdminSession(session);
        } else {
          // ANY account not strictly in authorized list is signed out and rejected immediately!
          console.warn('Unauthorized user attempted portal access:', emailLower);
          await signOut(auth);
          setCurrentUser(null);
          setAdminSession(null);
          localStorage.removeItem('rf_admin_session_auth');
        }
      } else {
        setCurrentUser(null);
        // Clear active session if not authenticated
        if (!localStorage.getItem('rf_admin_session_auth')) {
          setAdminSession(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Log in strictly as Admin (admin@gmail.com), Manager 1 (manager1@gmail.com), or Manager 2 (manager2@gmail.com)
   */
  const login = async (rawEmail, rawPassword) => {
    const normalizedEmail = normalizeAdminEmail(rawEmail);
    const cleanPass = (rawPassword || '').trim();

    if (!normalizedEmail || !cleanPass) {
      throw new Error('Please enter both email/username and password.');
    }

    // STRICT CHECK: ONLY admin@gmail.com, manager1@gmail.com, manager2@gmail.com are allowed!
    const matchedAccount = findAuthorizedAccount(normalizedEmail);
    if (!matchedAccount) {
      throw new Error('Access denied. Only authorized Admin, Manager 1, and Manager 2 accounts can log in.');
    }

    // 1. Authenticate with Firebase Authentication
    try {
      const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, cleanPass);
      const user = userCredential.user;
      const session = {
        ...matchedAccount,
        uid: user.uid,
        firebaseEmail: user.email,
      };

      // Record admin audit in Firestore
      try {
        await setDoc(
          doc(db, 'admins', user.uid),
          {
            ...session,
            lastLoginAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch {
        // Continue even if Firestore offline
      }

      setAdminSession(session);
      setCurrentUser(user);
      return { success: true, user, session };
    } catch (fbError) {
      // 2. Handle invalid credentials / wrong password strictly - NO BYPASS!
      if (
        fbError.code === 'auth/wrong-password' ||
        fbError.code === 'auth/invalid-credential'
      ) {
        throw new Error('Incorrect password. Please verify and try again.');
      }

      // 3. If user doesn't exist yet in Firebase Console, but password matches default pre-configured password:
      if (fbError.code === 'auth/user-not-found') {
        if (cleanPass === matchedAccount.password) {
          try {
            const newCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, cleanPass);
            const session = {
              ...matchedAccount,
              uid: newCredential.user.uid,
              firebaseEmail: newCredential.user.email,
            };
            setAdminSession(session);
            setCurrentUser(newCredential.user);
            return { success: true, user: newCredential.user, session };
          } catch {
            throw new Error('Account not found in Firebase Authentication or incorrect password.');
          }
        } else {
          throw new Error('Account not found in Firebase Authentication or incorrect password.');
        }
      }

      if (fbError.code === 'auth/too-many-requests') {
        throw new Error('Too many failed login attempts. Please wait a few moments.');
      }

      if (fbError.code === 'auth/invalid-email') {
        throw new Error('Invalid email format. Use admin@gmail.com, manager1@gmail.com, or manager2@gmail.com');
      }

      // If Firebase network is unreachable, allow strictly if password matches configured account password
      if (fbError.code === 'auth/network-request-failed') {
        if (cleanPass === matchedAccount.password) {
          const session = {
            ...matchedAccount,
            uid: `local-${matchedAccount.role}`,
          };
          setAdminSession(session);
          return { success: true, session };
        } else {
          throw new Error('Incorrect password.');
        }
      }

      throw new Error(fbError.message || 'Login failed. Please verify your credentials.');
    }
  };

  /**
   * Log out completely of Firebase and wipe stored session.
   */
  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    setAdminSession(null);
    setCurrentUser(null);
    localStorage.removeItem('rf_admin_session_auth');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        adminSession,
        login,
        logout,
        loading,
        isAuthenticated: Boolean(adminSession && findAuthorizedAccount(adminSession.email)),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
