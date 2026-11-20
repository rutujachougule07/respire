import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import {
  loginTrainerWithFirebase,
  logoutTrainerFromFirebase,
  sendTrainerPasswordReset,
  changeTrainerPasswordInFirebase,
} from '../services/trainerAuthService';
import { updateTrainerProfileInFirestore } from '../services/firestoreService';

const TrainerAuthContext = createContext(null);

export function TrainerAuthProvider({ children }) {
  const [trainerUser, setTrainerUser] = useState(null);
  const [trainerProfile, setTrainerProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [trainerSession, setTrainerSession] = useState(() => {
    try {
      const raw = sessionStorage.getItem('rf_trainer_session');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Fetch full trainer profile from Firestore
  const fetchTrainerProfile = async (uid, email) => {
    try {
      // Query by UID
      if (uid) {
        const qUid = query(collection(db, 'trainers'), where('uid', '==', uid));
        const snapUid = await getDocs(qUid);
        if (!snapUid.empty) {
          const docData = { id: snapUid.docs[0].id, ...snapUid.docs[0].data() };
          setTrainerProfile(docData);
          return docData;
        }
      }

      // Query by Email fallback
      if (email) {
        const qEmail = query(collection(db, 'trainers'), where('email', '==', email.toLowerCase()));
        const snapEmail = await getDocs(qEmail);
        if (!snapEmail.empty) {
          const docData = { id: snapEmail.docs[0].id, ...snapEmail.docs[0].data() };
          setTrainerProfile(docData);
          return docData;
        }
      }

      return null;
    } catch (err) {
      console.warn('Error fetching trainer profile:', err);
      return null;
    }
  };

  // Sync profile live with Firestore onSnapshot when trainerId is known
  useEffect(() => {
    if (!trainerProfile?.id) return;
    const unsub = onSnapshot(doc(db, 'trainers', trainerProfile.id), (docSnap) => {
      if (docSnap.exists()) {
        setTrainerProfile((prev) => ({ ...prev, ...docSnap.data() }));
      }
    });
    return () => unsub();
  }, [trainerProfile?.id]);

  // Listen to Firebase Auth state for trainer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // If this tab holds a valid trainer session or the user is a trainer
        let currentSession = null;
        try {
          const raw = sessionStorage.getItem('rf_trainer_session');
          if (raw) currentSession = JSON.parse(raw);
        } catch {
          // ignore
        }

        if (currentSession && (currentSession.uid === firebaseUser.uid || currentSession.email?.toLowerCase() === firebaseUser.email?.toLowerCase())) {
          setTrainerUser(firebaseUser);
          setTrainerSession(currentSession);
          await fetchTrainerProfile(firebaseUser.uid, firebaseUser.email);
        } else {
          // Verify if this user is a trainer
          const profile = await fetchTrainerProfile(firebaseUser.uid, firebaseUser.email);
          if (profile && profile.status === 'Active' && profile.role === 'trainer') {
            setTrainerUser(firebaseUser);
            const session = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              trainerId: profile.id,
              name: profile.name,
              specialty: profile.specialty,
              branchId: profile.branchId,
              phone: profile.phone,
              role: 'trainer',
            };
            setTrainerSession(session);
            try {
              sessionStorage.setItem('rf_trainer_session', JSON.stringify(session));
            } catch {
              // ignore
            }
          }
        }
      } else {
        // Logged out
        setTrainerUser(null);
        setTrainerProfile(null);
        setTrainerSession(null);
        try {
          sessionStorage.removeItem('rf_trainer_session');
        } catch {
          // ignore
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await loginTrainerWithFirebase(email, password);
      setTrainerUser(res.user);
      setTrainerProfile(res.trainer);
      setTrainerSession(res.session);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await logoutTrainerFromFirebase();
    setTrainerUser(null);
    setTrainerProfile(null);
    setTrainerSession(null);
  };

  const updateProfile = async (updates) => {
    if (!trainerProfile?.id) throw new Error('Trainer ID is missing');
    const safeUpdates = await updateTrainerProfileInFirestore(trainerProfile.id, updates);
    setTrainerProfile((prev) => ({ ...prev, ...safeUpdates }));
    return safeUpdates;
  };

  const changePassword = async (currentPassword, newPassword) => {
    return await changeTrainerPasswordInFirebase(currentPassword, newPassword);
  };

  const sendPasswordReset = async (email) => {
    return await sendTrainerPasswordReset(email);
  };

  const refreshProfile = async () => {
    if (trainerUser) {
      return await fetchTrainerProfile(trainerUser.uid, trainerUser.email);
    }
  };

  const isTrainerAuthenticated = Boolean(
    trainerSession &&
    trainerSession.role === 'trainer' &&
    (trainerProfile ? trainerProfile.status !== 'Inactive' : true)
  );

  return (
    <TrainerAuthContext.Provider
      value={{
        trainerUser,
        trainerProfile,
        trainerSession,
        isTrainerAuthenticated,
        loading,
        login,
        logout,
        updateProfile,
        changePassword,
        sendPasswordReset,
        refreshProfile,
      }}
    >
      {children}
    </TrainerAuthContext.Provider>
  );
}

export function useTrainerAuth() {
  const context = useContext(TrainerAuthContext);
  if (!context) {
    throw new Error('useTrainerAuth must be used within a TrainerAuthProvider');
  }
  return context;
}
