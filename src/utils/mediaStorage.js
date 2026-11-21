import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const DB_NAME = 'respire_media_db';
const STORE_NAME = 'media_blobs';
const DB_VERSION = 1;

/**
 * Open or create IndexedDB connection for resilient large binary media storage
 */
function openMediaDB() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = (err) => {
        console.warn('IndexedDB open error:', err);
        resolve(null);
      };
    } catch (e) {
      console.warn('IndexedDB not supported or blocked:', e);
      resolve(null);
    }
  });
}

/**
 * Store a large media file or Blob in IndexedDB (handles 100MB+ videos with zero quota issues)
 */
export async function storeMediaBlob(key, blobOrFile) {
  try {
    const db = await openMediaDB();
    if (!db) return false;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blobOrFile, key);
      req.onsuccess = () => resolve(true);
      req.onerror = (err) => {
        console.warn('storeMediaBlob error:', err);
        resolve(false);
      };
    });
  } catch (err) {
    console.warn('storeMediaBlob failed:', err);
    return false;
  }
}

/**
 * Retrieve a media Blob from IndexedDB
 */
export async function getMediaBlob(key) {
  try {
    const db = await openMediaDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = (err) => {
        console.warn('getMediaBlob error:', err);
        resolve(null);
      };
    });
  } catch (err) {
    console.warn('getMediaBlob failed:', err);
    return null;
  }
}

/**
 * Delete a media item from IndexedDB
 */
export async function deleteMediaBlob(key) {
  try {
    const db = await openMediaDB();
    if (!db) return false;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve(true);
      req.onerror = (err) => {
        console.warn('deleteMediaBlob error:', err);
        resolve(false);
      };
    });
  } catch (err) {
    console.warn('deleteMediaBlob failed:', err);
    return false;
  }
}

/**
 * Attempt upload to Firebase Storage with a timeout; falls back gracefully
 */
export async function uploadToFirebaseStorage(storagePath, file, timeoutMs = 25000) {
  try {
    if (!storage || !file) return null;
    const fileRef = ref(storage, storagePath);
    
    const uploadPromise = uploadBytes(fileRef, file).then(async (snap) => {
      return await getDownloadURL(snap.ref);
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firebase Storage upload timed out')), timeoutMs)
    );

    const downloadUrl = await Promise.race([uploadPromise, timeoutPromise]);
    return downloadUrl;
  } catch (err) {
    console.warn('Firebase Storage upload skipped or failed, using local resilient storage:', err.message);
    return null;
  }
}
