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

export const normalizeAdminEmail = (input) => {
  const clean = (input || '').trim().toLowerCase();
  if (clean === 'admin') return 'admin@gmail.com';
  if (clean === 'manager1') return 'manager1@gmail.com';
  if (clean === 'manager2') return 'manager2@gmail.com';
  return clean;
};

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
      // ignore
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
          await signOut(auth);
          setCurrentUser(null);
          setAdminSession(null);
          localStorage.removeItem('rf_admin_session_auth');
        }
      } else {
        setCurrentUser(null);
        if (!localStorage.getItem('rf_admin_session_auth')) {
          setAdminSession(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (rawEmail, rawPassword) => {
    const normalizedEmail = normalizeAdminEmail(rawEmail);
    const cleanPass = (rawPassword || '').trim();

    if (!normalizedEmail || !cleanPass) {
      throw new Error('Invalid email or password.');
    }

    const matchedAccount = findAuthorizedAccount(normalizedEmail);
    if (!matchedAccount) {
      throw new Error('Invalid email or password.');
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, cleanPass);
      const user = userCredential.user;
      const session = {
        ...matchedAccount,
        uid: user.uid,
        firebaseEmail: user.email,
      };

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
        // offline ignore
      }

      setAdminSession(session);
      setCurrentUser(user);
      return { success: true, user, session };
    } catch (fbError) {
      if (
        fbError.code === 'auth/wrong-password' ||
        fbError.code === 'auth/invalid-credential'
      ) {
        throw new Error('Invalid email or password.');
      }

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
            throw new Error('Invalid email or password.');
          }
        }
      }

      throw new Error('Invalid email or password.');
    }
  };

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
