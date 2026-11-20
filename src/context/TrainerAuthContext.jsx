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

  const [trainerProfile, setTrainerProfile] = useState(() => {
    try {
      const raw = localStorage.getItem('rf_trainer_profile') || sessionStorage.getItem('rf_trainer_profile');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [trainerSession, setTrainerSession] = useState(() => {
    try {
      const raw = localStorage.getItem('rf_trainer_session') || sessionStorage.getItem('rf_trainer_session');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // If a valid saved trainer session exists, do not block page render with loading screen
  const [loading, setLoading] = useState(() => {
    try {
      const raw = localStorage.getItem('rf_trainer_session') || sessionStorage.getItem('rf_trainer_session');
      return !raw;
    } catch {
      return true;
    }
  });

  // Fetch full trainer profile from Firestore
  const fetchTrainerProfile = async (uid, email) => {
    try {
      let docData = null;

      // Query by UID
      if (uid) {
        const qUid = query(collection(db, 'trainers'), where('uid', '==', uid));
        const snapUid = await getDocs(qUid);
        if (!snapUid.empty) {
          docData = { id: snapUid.docs[0].id, ...snapUid.docs[0].data() };
        }
      }

      // Query by Email fallback
      if (!docData && email) {
        const qEmail = query(collection(db, 'trainers'), where('email', '==', email.toLowerCase()));
        const snapEmail = await getDocs(qEmail);
        if (!snapEmail.empty) {
          docData = { id: snapEmail.docs[0].id, ...snapEmail.docs[0].data() };
        }
      }

      if (docData) {
        setTrainerProfile(docData);
        try {
          localStorage.setItem('rf_trainer_profile', JSON.stringify(docData));
          sessionStorage.setItem('rf_trainer_profile', JSON.stringify(docData));
        } catch {
          // ignore
        }
        return docData;
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
        const updated = { ...trainerProfile, ...docSnap.data() };
        setTrainerProfile(updated);
        try {
          localStorage.setItem('rf_trainer_profile', JSON.stringify(updated));
          sessionStorage.setItem('rf_trainer_profile', JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
    });
    return () => unsub();
  }, [trainerProfile?.id]);

  // Listen to Firebase Auth state for trainer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      let savedSession = null;
      try {
        const raw = localStorage.getItem('rf_trainer_session') || sessionStorage.getItem('rf_trainer_session');
        if (raw) savedSession = JSON.parse(raw);
      } catch {
        // ignore
      }

      if (firebaseUser) {
        setTrainerUser(firebaseUser);

        // Fetch / refresh profile from Firestore
        const profile = await fetchTrainerProfile(firebaseUser.uid, firebaseUser.email);
        if (profile) {
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
            localStorage.setItem('rf_trainer_session', JSON.stringify(session));
            sessionStorage.setItem('rf_trainer_session', JSON.stringify(session));
          } catch {
            // ignore
          }
        } else if (savedSession) {
          // Keep existing saved session if trainer doc query is pending or temporarily unavailable
          setTrainerSession(savedSession);
        }
      } else {
        // If firebaseUser is null but an active saved session exists in localStorage,
        // DO NOT log out the trainer on refresh! Keep them logged in until explicit logout.
        if (savedSession) {
          setTrainerSession(savedSession);
        } else {
          setTrainerUser(null);
          setTrainerProfile(null);
          setTrainerSession(null);
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
      try {
        localStorage.setItem('rf_trainer_session', JSON.stringify(res.session));
        localStorage.setItem('rf_trainer_profile', JSON.stringify(res.trainer));
        sessionStorage.setItem('rf_trainer_session', JSON.stringify(res.session));
        sessionStorage.setItem('rf_trainer_profile', JSON.stringify(res.trainer));
      } catch {
        // ignore
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutTrainerFromFirebase();
    } catch {
      // ignore
    }
    setTrainerUser(null);
    setTrainerProfile(null);
    setTrainerSession(null);
    try {
      localStorage.removeItem('rf_trainer_session');
      localStorage.removeItem('rf_trainer_profile');
      sessionStorage.removeItem('rf_trainer_session');
      sessionStorage.removeItem('rf_trainer_profile');
    } catch {
      // ignore
    }
  };

  const updateProfile = async (updates) => {
    if (!trainerProfile?.id) throw new Error('Trainer ID is missing');
    const safeUpdates = await updateTrainerProfileInFirestore(trainerProfile.id, updates);
    const updated = { ...trainerProfile, ...safeUpdates };
    setTrainerProfile(updated);
    try {
      localStorage.setItem('rf_trainer_profile', JSON.stringify(updated));
    } catch {
      // ignore
    }
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
    (trainerSession.uid || trainerSession.trainerId || trainerSession.email) &&
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
