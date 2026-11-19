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
export async function seedInitialDataIfEmpty() {
  if (isSeeding) {
    return { success: true, message: 'Seeding already in progress' };
  }

  try {
    isSeeding = true;

    // Check system seed lock document
    const seedLockRef = doc(db, 'system', 'seed_status');
    const seedLockSnap = await getDoc(seedLockRef).catch(() => null);

    if (seedLockSnap && seedLockSnap.exists() && seedLockSnap.data()?.isSeeded) {
      isSeeding = false;
      return { success: true, message: 'Database already seeded' };
    }

    // 1. Seed Membership Plans (idempotent setDoc by plan.id)
    for (const plan of INITIAL_PLANS) {
      const planRef = doc(db, 'plans', plan.id);
      await setDoc(planRef, { ...plan, updatedAt: serverTimestamp() }, { merge: true });
    }

    // 2. Seed Trainers (idempotent setDoc by trainer.id)
    for (const trainer of INITIAL_TRAINERS) {
      const trRef = doc(db, 'trainers', trainer.id);
      await setDoc(trRef, { ...trainer, updatedAt: serverTimestamp() }, { merge: true });
    }

    // 3. Seed Initial Members (idempotent setDoc by member.id)
    for (const member of INITIAL_MEMBERS) {
      const memberRef = doc(db, 'members', member.id);
      await setDoc(memberRef, { ...member, updatedAt: serverTimestamp() }, { merge: true });
    }

    // 4. Seed Initial Addon Revenue (idempotent setDoc by addon.id)
    for (const addon of INITIAL_ADDON_REVENUE) {
      const addonRef = doc(db, 'addons', addon.id);
      await setDoc(addonRef, { ...addon, updatedAt: serverTimestamp() }, { merge: true });
    }

    // Mark system seed lock doc as completed
    await setDoc(
      seedLockRef,
      {
        isSeeded: true,
        seededAt: serverTimestamp(),
        version: '1.0.0',
      },
      { merge: true }
    );

    isSeeding = false;
    return { success: true, message: 'Initial data seeded successfully without duplicates' };
  } catch (error) {
    isSeeding = false;
    console.warn('Firestore seeding notice (using local fallback if offline/restricted):', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Subscribes to a Firestore collection with real-time onSnapshot.
 * Automatically deduplicates items by doc.id and handles cleanup.
 */
export function subscribeToCollection(collectionName, onData, onError, fallbackData = []) {
  try {
    const colRef = collection(db, collectionName);
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty && fallbackData && fallbackData.length > 0) {
          onData(deduplicateById(fallbackData));
          return;
        }
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        onData(deduplicateById(items));
      },
      (error) => {
        console.warn(`Firestore subscription notice for [${collectionName}]:`, error.message);
        if (onError) onError(error);
        if (fallbackData) onData(deduplicateById(fallbackData));
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn(`Firestore connect notice for [${collectionName}]:`, err.message);
    if (fallbackData) onData(deduplicateById(fallbackData));
    return () => {};
  }
}

/**
 * Adds or updates a member in Firestore idempotently.
 * Checks for duplicate phone numbers across members.
 */
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
