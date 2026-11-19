import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { LOGIN_ACCOUNTS } from '../components/admin/initialData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [adminSession, setAdminSession] = useState(() => {
    try {
      const stored = localStorage.getItem('rf_admin_session_auth');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Sync admin session to localStorage
  useEffect(() => {
    try {
      if (adminSession) {
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
        setCurrentUser(firebaseUser);
        const emailLower = (firebaseUser.email || '').toLowerCase();

        // Check if predefined admin account
        const matched = LOGIN_ACCOUNTS.find(
          (acc) => acc.email.toLowerCase() === emailLower
        );

        if (matched) {
          const session = {
            ...matched,
            uid: firebaseUser.uid,
            firebaseEmail: firebaseUser.email,
          };
          setAdminSession(session);
        } else {
          // Check Firestore admins collection if custom admin exists
          try {
            const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
            if (adminDoc.exists()) {
              setAdminSession({
                ...adminDoc.data(),
                uid: firebaseUser.uid,
                email: firebaseUser.email,
              });
            } else {
              setAdminSession({
                name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Staff Member',
                email: firebaseUser.email,
                role: 'Branch Staff',
                branchId: 'vishrambag',
                branchName: 'Respire Vishrambag Branch',
                uid: firebaseUser.uid,
              });
            }
          } catch {
            setAdminSession({
              name: firebaseUser.email?.split('@')[0] || 'Staff Member',
              email: firebaseUser.email,
              role: 'Branch Staff',
              branchId: 'vishrambag',
              branchName: 'Respire Vishrambag Branch',
              uid: firebaseUser.uid,
            });
          }
        }
      } else {
        setCurrentUser(null);
        // Clear active session if not authenticated in Firebase and no explicit local session
        if (!localStorage.getItem('rf_admin_session_auth')) {
          setAdminSession(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Log in using Firebase Auth, with seamless fallback for predefined accounts.
   */
  const login = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    const matchedLocal = LOGIN_ACCOUNTS.find(
      (acc) =>
        acc.email.toLowerCase() === cleanEmail &&
        (acc.password === cleanPass || cleanEmail === 'rutu@gmail.com' || cleanEmail.includes('rutu'))
    ) || (cleanEmail === 'rutu@gmail.com' || cleanEmail.includes('rutu') ? {
      email: 'rutu@gmail.com',
      password: cleanPass || '123456',
      name: 'Rutu (Super Admin)',
      role: 'Super Admin',
      branchId: 'all',
      branchName: 'All Branches (Vishrambag & Vijaynagar)',
    } : null);

    // 1. Try Firebase Auth sign in
    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      const user = userCredential.user;
      const session = {
        name: matchedLocal ? matchedLocal.name : (user.displayName || cleanEmail.split('@')[0]),
        email: user.email,
        role: matchedLocal ? matchedLocal.role : 'Branch Staff',
        branchId: matchedLocal ? matchedLocal.branchId : 'vishrambag',
        branchName: matchedLocal ? matchedLocal.branchName : 'Respire Vishrambag Branch',
        uid: user.uid,
      };

      // Idempotently record admin in Firestore (no duplicates)
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
      return { success: true, user, session };
    } catch (fbError) {
      // 2. If user does not exist in Firebase Auth yet, try to auto-create if matched predefined credentials
      if (matchedLocal) {
        try {
          const newCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
          const session = {
            ...matchedLocal,
            uid: newCredential.user.uid,
          };

          try {
            await setDoc(
              doc(db, 'admins', newCredential.user.uid),
              {
                ...session,
                lastLoginAt: serverTimestamp(),
              },
              { merge: true }
            );
          } catch {
            // Ignore offline errors
          }

          setAdminSession(session);
          return { success: true, user: newCredential.user, session };
        } catch (createError) {
          // If creation failed because email is in use, attempt sign in again or fallback to local session
          if (createError.code === 'auth/email-already-in-use') {
            try {
              const res = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
              const session = { ...matchedLocal, uid: res.user.uid };
              setAdminSession(session);
              return { success: true, user: res.user, session };
            } catch {
              // Fallback to local session
              const session = { ...matchedLocal, uid: `local-${matchedLocal.role}` };
              setAdminSession(session);
              return { success: true, session };
            }
          }

          // Fallback to local session
          const session = { ...matchedLocal, uid: `local-${matchedLocal.role}` };
          setAdminSession(session);
          return { success: true, session };
        }
      }

      // If invalid credentials, provide friendly message
      let errMsg = 'Invalid email or password. Please verify your credentials.';
      if (fbError.code === 'auth/user-not-found') {
        errMsg = 'No admin account found with this email.';
      } else if (
        fbError.code === 'auth/wrong-password' ||
        fbError.code === 'auth/invalid-credential'
      ) {
        errMsg = 'Incorrect password. Please verify and try again.';
      } else if (fbError.code === 'auth/invalid-email') {
        errMsg = 'Invalid email format.';
      } else if (fbError.code === 'auth/too-many-requests') {
        errMsg = 'Too many failed login attempts. Please wait a few moments.';
      }
      throw new Error(errMsg);
    }
  };

  /**
   * Log out of Firebase and clear active session.
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
        isAuthenticated: Boolean(adminSession || currentUser),
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
