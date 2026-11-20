import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { LOGIN_ACCOUNTS } from '../components/admin/initialData';

const AuthContext = createContext(null);

export const normalizeAdminEmail = (input) => {
  const clean = (input || '').trim().toLowerCase();
  if (clean === 'rutu') return 'rutu@gmail.com';
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
      // Clean up legacy cross-tab storage to prevent multi-tab leaks
      localStorage.removeItem('rf_admin_session_auth');

      // Use sessionStorage so EACH BROWSER TAB is strictly isolated
      const stored = sessionStorage.getItem('rf_tab_admin_session');
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      const matched = findAuthorizedAccount(parsed?.email);
      return matched ? { ...matched, ...parsed } : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Configure Firebase to use browserSessionPersistence (strictly scoped to this tab)
  useEffect(() => {
    try {
      setPersistence(auth, browserSessionPersistence).catch(() => {});
    } catch {
      // ignore
    }
  }, []);

  // Sync admin session strictly to sessionStorage (isolated per tab)
  useEffect(() => {
    try {
      if (adminSession && findAuthorizedAccount(adminSession.email)) {
        sessionStorage.setItem('rf_tab_admin_session', JSON.stringify(adminSession));
      } else {
        sessionStorage.removeItem('rf_tab_admin_session');
      }
      // Never allow legacy localStorage to sync across tabs
      localStorage.removeItem('rf_admin_session_auth');
    } catch {
      // ignore
    }
  }, [adminSession]);

  // Listen to Firebase Auth state while protecting current tab from cross-tab overrides
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Check current tab's active session
      let tabSession = null;
      try {
        const raw = sessionStorage.getItem('rf_tab_admin_session');
        if (raw) tabSession = JSON.parse(raw);
      } catch {
        // ignore
      }

      if (firebaseUser) {
        const emailLower = (firebaseUser.email || '').toLowerCase();
        const matched = findAuthorizedAccount(emailLower);

        if (matched) {
          // If this tab already has a valid session for a DIFFERENT user, do NOT overwrite it
          if (tabSession && tabSession.email && tabSession.email.toLowerCase() !== emailLower) {
            setLoading(false);
            return;
          }

          setCurrentUser(firebaseUser);
          const session = {
            ...matched,
            uid: firebaseUser.uid,
            firebaseEmail: firebaseUser.email,
          };
          setAdminSession(session);
          try {
            sessionStorage.setItem('rf_tab_admin_session', JSON.stringify(session));
          } catch {
            // ignore
          }
        } else {
          // Not an authorized gym admin role (may be a trainer or other user)
          if (!tabSession) {
            setCurrentUser(null);
            setAdminSession(null);
            sessionStorage.removeItem('rf_tab_admin_session');
          }
        }
      } else {
        // If firebaseUser is null but this tab has its own valid session, maintain it
        if (tabSession && findAuthorizedAccount(tabSession.email)) {
          setAdminSession(tabSession);
        } else {
          setCurrentUser(null);
          setAdminSession(null);
          sessionStorage.removeItem('rf_tab_admin_session');
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
      try {
        await setPersistence(auth, browserSessionPersistence);
      } catch {
        // ignore
      }

      const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, cleanPass);
      const user = userCredential.user;
      const session = {
        ...matchedAccount,
        uid: user.uid,
        firebaseEmail: user.email,
      };

      try {
        sessionStorage.setItem('rf_tab_admin_session', JSON.stringify(session));
        localStorage.removeItem('rf_admin_session_auth');
      } catch {
        // ignore
      }

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
      // If entered password matches the authorized account password, try creating the Firebase user or fall back to local session
      if (cleanPass === matchedAccount.password) {
        try {
          const newCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, cleanPass);
          const session = {
            ...matchedAccount,
            uid: newCredential.user.uid,
            firebaseEmail: newCredential.user.email,
          };
          try {
            sessionStorage.setItem('rf_tab_admin_session', JSON.stringify(session));
            localStorage.removeItem('rf_admin_session_auth');
          } catch {
            // ignore
          }
          setAdminSession(session);
          setCurrentUser(newCredential.user);
          return { success: true, user: newCredential.user, session };
        } catch {
          // If creation fails (e.g. already exists with different internal state or offline), allow authorized session
          const session = {
            ...matchedAccount,
            uid: `auth-${matchedAccount.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
          };
          try {
            sessionStorage.setItem('rf_tab_admin_session', JSON.stringify(session));
            localStorage.removeItem('rf_admin_session_auth');
          } catch {
            // ignore
          }
          setAdminSession(session);
          return { success: true, session };
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
    try {
      sessionStorage.removeItem('rf_tab_admin_session');
      localStorage.removeItem('rf_admin_session_auth');
    } catch {
      // ignore
    }
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
