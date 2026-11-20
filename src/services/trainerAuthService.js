import { initializeApp, getApp, getApps } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { doc, getDoc, getDocs, collection, query, where, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, firebaseConfig } from '../firebase';

const SECONDARY_APP_NAME = 'RespireTrainerCreatorApp';

/**
 * Creates a real Firebase Authentication account for a Trainer without signing out the Admin.
 * Uses an isolated secondary Firebase App instance.
 */
export async function createTrainerAuthAccount(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please provide a valid email address for the trainer account.');
  }
  if (!cleanPass || cleanPass.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  let secondaryApp;
  try {
    if (getApps().some((app) => app.name === SECONDARY_APP_NAME)) {
      secondaryApp = getApp(SECONDARY_APP_NAME);
    } else {
      secondaryApp = initializeApp(firebaseConfig, SECONDARY_APP_NAME);
    }
  } catch {
    secondaryApp = initializeApp(firebaseConfig, `${SECONDARY_APP_NAME}_${Date.now()}`);
  }

  const secondaryAuth = getAuth(secondaryApp);

  try {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, cleanEmail, cleanPass);
    const user = cred.user;

    // Immediately sign out secondary auth so it remains completely clean
    await signOut(secondaryAuth).catch(() => {});

    return {
      uid: user.uid,
      email: user.email,
    };
  } catch (error) {
    await signOut(secondaryAuth).catch(() => {});
    if (error.code === 'auth/email-already-in-use') {
      throw new Error(`A Firebase account already exists for ${cleanEmail}. Please use another email address or edit the existing trainer.`);
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('The email address format is invalid.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('The password is too weak. Please use at least 6 characters.');
    } else {
      throw new Error(error.message || 'Failed to create trainer authentication account.');
    }
  }
}

/**
 * Authenticates a Trainer via Firebase Auth and verifies their active trainer role in Firestore.
 */
export async function loginTrainerWithFirebase(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  if (!cleanEmail || !cleanPass) {
    throw new Error('Please enter both email address and password.');
  }

  // 1. Sign in with Firebase Authentication
  const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
  const user = userCredential.user;

  // 2. Fetch trainer document from Firestore
  let trainerData = null;

  // Check by UID first
  const qByUid = query(collection(db, 'trainers'), where('uid', '==', user.uid));
  const snapByUid = await getDocs(qByUid).catch(() => null);

  if (snapByUid && !snapByUid.empty) {
    trainerData = { id: snapByUid.docs[0].id, ...snapByUid.docs[0].data() };
  } else {
    // Check by email
    const qByEmail = query(collection(db, 'trainers'), where('email', '==', cleanEmail));
    const snapByEmail = await getDocs(qByEmail).catch(() => null);

    if (snapByEmail && !snapByEmail.empty) {
      trainerData = { id: snapByEmail.docs[0].id, ...snapByEmail.docs[0].data() };
      // Link UID if not present
      if (!trainerData.uid) {
        await updateDoc(doc(db, 'trainers', trainerData.id), {
          uid: user.uid,
          updatedAt: serverTimestamp(),
        }).catch(() => {});
        trainerData.uid = user.uid;
      }
    }
  }

  // 3. Role and status validations
  if (!trainerData) {
    await signOut(auth).catch(() => {});
    throw new Error('No registered Trainer profile was found for this account. If you are an Admin, please use the Admin Portal Login.');
  }

  if (trainerData.status === 'Inactive') {
    await signOut(auth).catch(() => {});
    throw new Error('Your Trainer account is currently inactive. Please contact the Gym Super Admin to reactivate.');
  }

  // Record last login in Firestore
  try {
    await updateDoc(doc(db, 'trainers', trainerData.id), {
      lastLoginAt: serverTimestamp(),
    });
  } catch {
    // non-fatal
  }

  const session = {
    uid: user.uid,
    email: user.email,
    trainerId: trainerData.id,
    name: trainerData.name,
    specialty: trainerData.specialty,
    branchId: trainerData.branchId,
    phone: trainerData.phone,
    role: 'trainer',
  };

  try {
    sessionStorage.setItem('rf_trainer_session', JSON.stringify(session));
  } catch {
    // ignore
  }

  return { user, trainer: trainerData, session };
}

/**
 * Signs out the trainer from Firebase Auth and clears session.
 */
export async function logoutTrainerFromFirebase() {
  try {
    await signOut(auth);
  } catch {
    // ignore
  }
  try {
    sessionStorage.removeItem('rf_trainer_session');
  } catch {
    // ignore
  }
}

/**
 * Triggers a real Firebase password reset email.
 */
export async function sendTrainerPasswordReset(email) {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please enter a valid email address to receive the password reset link.');
  }

  try {
    await sendPasswordResetEmail(auth, cleanEmail);
    return { success: true };
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      throw new Error(`No account found registered under ${cleanEmail}. Please verify the email or contact Admin.`);
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('The email address format is invalid.');
    } else {
      throw new Error(error.message || 'Unable to send password reset email at this moment.');
    }
  }
}

/**
 * Securely changes the authenticated trainer's password in Firebase Authentication.
 * Reauthenticates using current password first if needed.
 */
export async function changeTrainerPasswordInFirebase(currentPassword, newPassword) {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error('No authenticated trainer session found. Please log in again.');
  }

  if (!newPassword || newPassword.trim().length < 6) {
    throw new Error('New password must be at least 6 characters long.');
  }

  if (!currentPassword) {
    throw new Error('Please enter your current password to verify your identity.');
  }

  // 1. Re-authenticate
  const credential = EmailAuthProvider.credential(user.email, currentPassword.trim());
  try {
    await reauthenticateWithCredential(user, credential);
  } catch (authErr) {
    if (authErr.code === 'auth/wrong-password' || authErr.code === 'auth/invalid-credential') {
      throw new Error('Current password is incorrect. Please check and try again.');
    }
    throw new Error('Identity verification failed. Please re-enter your current password.');
  }

  // 2. Update password in Firebase Authentication
  try {
    await updatePassword(user, newPassword.trim());
    return { success: true };
  } catch (updateErr) {
    if (updateErr.code === 'auth/weak-password') {
      throw new Error('The new password is too weak. Please use at least 6 characters with mixed letters and numbers.');
    } else if (updateErr.code === 'auth/requires-recent-login') {
      throw new Error('For security reasons, please log out and log in again before changing your password.');
    }
    throw new Error(updateErr.message || 'Failed to update password in Firebase Authentication.');
  }
}
