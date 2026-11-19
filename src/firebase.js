import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration for Respire Fitness
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC4edzQAonqiJDoRVaoIVqWl2_bIWlI5zo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "respire-7001f.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "respire-7001f",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "respire-7001f.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "489116493814",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:489116493814:web:f7a215a8d75cdd92f6c9d7",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-D6KW9Y9Z2S",
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore Database
export const db = getFirestore(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Initialize Firebase Analytics safely (checks for browser environment support)
export let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics not supported in this environment
  });
}

export default app;

