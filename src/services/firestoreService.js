import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  INITIAL_MEMBERS,
  INITIAL_PLANS,
  INITIAL_TRAINERS,
  INITIAL_ADDON_REVENUE,
  PERSONAL_TRAINING_RATES,
} from '../components/admin/initialData';

/**
 * Deduplication helper: guarantees unique items by 'id'
 * Prevents any duplicate documents or state entries from rendering or storing.
 */
export function deduplicateById(items = []) {
  if (!Array.isArray(items)) return [];
  const map = new Map();
  for (const item of items) {
    if (item && item.id !== undefined && item.id !== null) {
      map.set(String(item.id), item);
    }
  }
  return Array.from(map.values());
}

// In-memory mutex to prevent double-seeding during React StrictMode double-mounting
let isSeeding = false;

/**
 * Seeds initial gym data into Firestore ONLY if not already initialized.
 * Uses deterministic document IDs and setDoc({ merge: true }) so NO DUPLICATES can ever be created.
 */
export async function purgeAllDummyDataFromFirestore() {
  const dummyMemberIds = [
    'RF-1001', 'RF-1002', 'RF-1003', 'RF-1004', 'RF-1005', 'RF-1006', 'RF-1007', 'RF-1008',
    'RF-2001', 'RF-2002', 'RF-2003', 'RF-2004'
  ];
  const dummyTrainerIds = ['tr-1', 'tr-2', 'tr-3', 'tr-4', 'tr-5'];
  const dummyAddonIds = ['ao-1', 'ao-2', 'ao-3', 'ao-4', 'ao-5', 'ao-6', 'ao-7', 'ao-8', 'ao-9', 'ao-10'];

  try {
    for (const id of dummyMemberIds) {
      await deleteDoc(doc(db, 'members', id)).catch(() => {});
    }
    for (const id of dummyTrainerIds) {
      await deleteDoc(doc(db, 'trainers', id)).catch(() => {});
    }
    for (const id of dummyAddonIds) {
      await deleteDoc(doc(db, 'addons', id)).catch(() => {});
    }
  } catch (err) {
    console.warn('Dummy cleanup notice:', err);
  }
}

export async function deleteMemberFromFirestore(memberId) {
  const memberRef = doc(db, 'members', memberId);
  await deleteDoc(memberRef);
}

export async function deleteTrainerFromFirestore(trainerId) {
  const trRef = doc(db, 'trainers', trainerId);
  await deleteDoc(trRef);
}

export async function deleteAddonFromFirestore(addonId) {
  const addonRef = doc(db, 'addons', addonId);
  await deleteDoc(addonRef);
}

export async function seedInitialDataIfEmpty() {
  if (isSeeding) {
    return { success: true, message: 'Seeding already in progress' };
  }

  try {
    isSeeding = true;
    await purgeAllDummyDataFromFirestore();

    const seedLockRef = doc(db, 'system', 'seed_status_v3');
    const seedLockSnap = await getDoc(seedLockRef).catch(() => null);

    if (seedLockSnap && seedLockSnap.exists() && seedLockSnap.data()?.isSeeded) {
      isSeeding = false;
      return { success: true, message: 'Database already initialized' };
    }

    // Seed ONLY official plans (no mock members or trainers)
    for (const plan of INITIAL_PLANS) {
      const planRef = doc(db, 'plans', plan.id);
      await setDoc(planRef, { ...plan, updatedAt: serverTimestamp() }, { merge: true });
    }

    await setDoc(
      doc(db, 'system', 'pt_rates'),
      {
        ...PERSONAL_TRAINING_RATES,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    await setDoc(
      seedLockRef,
      {
        isSeeded: true,
        seededAt: serverTimestamp(),
        version: '3.0.0',
      },
      { merge: true }
    );

    isSeeding = false;
    return { success: true, message: 'Official gym plans initialized' };
  } catch (error) {
    isSeeding = false;
    console.warn('Firestore seeding notice:', error.message);
    return { success: false, error: error.message };
  }
}

export function subscribeToCollection(collectionName, onData, onError) {
  try {
    const colRef = collection(db, collectionName);
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        onData(deduplicateById(items));
      },
      (error) => {
        console.warn(`Firestore subscription notice for [${collectionName}]:`, error.message);
        if (onError) onError(error);
        onData([]);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn(`Firestore connect notice for [${collectionName}]:`, err.message);
    onData([]);
    return () => {};
  }
}

export async function saveMemberToFirestore(member, existingMembers = []) {
  if (!member.id) {
    throw new Error('Member ID is required');
  }

  // Prevent duplicate phone numbers for different members
  if (member.phone) {
    const normalizedPhone = member.phone.replace(/\D/g, '');
    const duplicate = existingMembers.find(
      (m) => m.id !== member.id && m.phone && m.phone.replace(/\D/g, '') === normalizedPhone
    );
    if (duplicate) {
      throw new Error(`Phone number already registered to member "${duplicate.name}" (${duplicate.id})`);
    }
  }

  const memberRef = doc(db, 'members', member.id);
  await setDoc(
    memberRef,
    {
      ...member,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return member;
}

/**
 * Updates a member's status (Active / Deactivated) in Firestore in place.
 */
export async function updateMemberStatusInFirestore(memberId, status) {
  const memberRef = doc(db, 'members', memberId);
  await setDoc(memberRef, { status, updatedAt: serverTimestamp() }, { merge: true });
}

/**
 * Adds or updates a membership plan in Firestore idempotently.
 */
export async function savePlanToFirestore(plan) {
  if (!plan.id) {
    throw new Error('Plan ID is required');
  }
  const planRef = doc(db, 'plans', plan.id);
  await setDoc(
    planRef,
    {
      ...plan,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  return plan;
}

/**
 * Deletes a membership plan from Firestore.
 */
export async function deletePlanFromFirestore(planId) {
  const planRef = doc(db, 'plans', planId);
  await deleteDoc(planRef);
}

/**
 * Adds or updates a trainer in Firestore idempotently.
 */
export async function saveTrainerToFirestore(trainer) {
  if (!trainer.id) {
    throw new Error('Trainer ID is required');
  }
  const trRef = doc(db, 'trainers', trainer.id);
  await setDoc(
    trRef,
    {
      ...trainer,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  return trainer;
}

/**
 * Adds or logs addon revenue to Firestore idempotently.
 */
export async function saveAddonToFirestore(addon) {
  if (!addon.id) {
    throw new Error('Addon ID is required');
  }
  const addonRef = doc(db, 'addons', addon.id);
  await setDoc(
    addonRef,
    {
      ...addon,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  return addon;
}

// In-memory anti-spam debounce map for inquiry submissions
const recentInquirySubmissions = new Map();

/**
 * Saves a contact/trial inquiry to Firestore.
 * Prevents double entry / duplicate submissions using debounced idempotency key.
 */
export async function submitInquiryToFirestore(inquiryData) {
  const phoneClean = (inquiryData.phone || '').replace(/\D/g, '');
  const now = Date.now();

  // Deduplication check: if identical phone submitted in last 45 seconds, block duplicate
  const lastTime = recentInquirySubmissions.get(phoneClean);
  if (lastTime && now - lastTime < 45000) {
    throw new Error('An inquiry was just submitted with this phone number. Please wait a moment.');
  }

  // Mark submission timestamp
  if (phoneClean) {
    recentInquirySubmissions.set(phoneClean, now);
  }

  // Deterministic timestamp doc ID
  const docId = `inq_${phoneClean || 'anon'}_${now}`;
  const inquiryRef = doc(db, 'inquiries', docId);

  const payload = {
    id: docId,
    name: inquiryData.name || '',
    phone: inquiryData.phone || '',
    branch: inquiryData.branch || 'Respire Vishrambag Branch',
    service: inquiryData.service || 'Personal Training',
    program: inquiryData.program || 'Beginner',
    notes: inquiryData.notes || '',
    source: 'Website Contact Form',
    status: 'New',
    createdAt: serverTimestamp(),
    submittedAt: new Date().toISOString(),
  };

  await setDoc(inquiryRef, payload, { merge: true });
  return payload;
}

/**
 * Updates inquiry status (e.g. New -> Contacted -> Converted) in Firestore.
 */
export async function updateInquiryStatusInFirestore(inquiryId, status) {
  const inquiryRef = doc(db, 'inquiries', inquiryId);
  await setDoc(inquiryRef, { status, updatedAt: serverTimestamp() }, { merge: true });
}
