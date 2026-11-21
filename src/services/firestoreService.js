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

export const DEFAULT_SPECIAL_PLANS = {
  vishrambag: [
    {
      id: 'pt-vb-general',
      title: 'GENERAL PERSONAL TRAINING',
      badge: 'Certified Coach',
      alternatePrice: 7000,
      dailyPrice: 10000,
      pricing: [
        { planName: 'Alternate Days', price: 7000, priceDisplay: '₹7,000/-', duration: '1 Month' },
        { planName: 'Daily Personal Training', price: 10000, priceDisplay: '₹10,000/-', duration: '1 Month' },
      ],
    },
    {
      id: 'pt-vb-premium',
      title: 'PREMIUM PERSONAL TRAINING',
      badge: 'Elite Specialist',
      alternatePrice: 9000,
      dailyPrice: 13000,
      isPremium: true,
      pricing: [
        { planName: 'Alternate Days', price: 9000, priceDisplay: '₹9,000/-', duration: '1 Month' },
        { planName: 'Daily Personal Training', price: 13000, priceDisplay: '₹13,000/-', duration: '1 Month' },
      ],
    },
  ],
  vijaynagar: [
    {
      id: 'pt-vjn-junior',
      title: 'JUNIOR PERSONAL TRAINER',
      badge: 'Junior Coach',
      alternatePrice: 4500,
      dailyPrice: 8000,
      pricing: [
        { planName: 'Alternate Days', price: 4500, priceDisplay: '₹4,500/-', duration: '1 Month' },
        { planName: 'Daily Personal Training', price: 8000, priceDisplay: '₹8,000/-', duration: '1 Month' },
      ],
    },
    {
      id: 'pt-vjn-senior',
      title: 'SENIOR PERSONAL TRAINER',
      badge: 'Senior Coach',
      alternatePrice: 5500,
      dailyPrice: 10000,
      isPremium: true,
      pricing: [
        { planName: 'Alternate Days', price: 5500, priceDisplay: '₹5,500/-', duration: '1 Month' },
        { planName: 'Daily Personal Training', price: 10000, priceDisplay: '₹10,000/-', duration: '1 Month' },
      ],
    },
  ],
};

export async function seedInitialDataIfEmpty() {
  if (isSeeding) {
    return { success: true, message: 'Seeding already in progress' };
  }

  try {
    isSeeding = true;
    await purgeAllDummyDataFromFirestore();

    const vbRef = doc(db, 'plans', 'vishrambag');
    const vjnRef = doc(db, 'plans', 'vijaynagar');

    const vbSnap = await getDoc(vbRef).catch(() => null);
    const vjnSnap = await getDoc(vjnRef).catch(() => null);

    const defaultVbRegular = INITIAL_PLANS.filter((p) => p.branchId === 'vishrambag');
    const defaultVjnRegular = INITIAL_PLANS.filter((p) => p.branchId === 'branch2' || p.branchId === 'vijaynagar');

    // 1. Seed or merge plans/vishrambag with regularPlans & specialPlans
    if (!vbSnap || !vbSnap.exists() || !vbSnap.data()?.regularPlans) {
      await setDoc(
        vbRef,
        {
          branchId: 'vishrambag',
          branchName: 'Respire Vishrambag Branch (R City Mall)',
          regularPlans: defaultVbRegular,
          specialPlans: DEFAULT_SPECIAL_PLANS.vishrambag,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }

    // 2. Seed or merge plans/vijaynagar with regularPlans & specialPlans
    if (!vjnSnap || !vjnSnap.exists() || !vjnSnap.data()?.regularPlans) {
      await setDoc(
        vjnRef,
        {
          branchId: 'branch2',
          branchName: 'Respire Vijaynagar Branch (Krishna Heights)',
          regularPlans: defaultVjnRegular,
          specialPlans: DEFAULT_SPECIAL_PLANS.vijaynagar,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }

    // 3. Purge legacy standalone loose plan docs so Firestore displays ONLY vishrambag and vijaynagar in plans
    const legacyFlatPlanIds = [
      'plan-1', 'plan-2', 'plan-3', 'plan-4',
      'plan-vjn-day', 'plan-vjn-1', 'plan-vjn-2', 'plan-vjn-3', 'plan-vjn-4',
    ];
    for (const pId of legacyFlatPlanIds) {
      await deleteDoc(doc(db, 'plans', pId)).catch(() => {});
    }

    // 4. Clean up legacy duplicate documents from system/settings
    await deleteDoc(doc(db, 'system', 'pt_rates')).catch(() => {});
    await deleteDoc(doc(db, 'settings', 'ptFeeStructure')).catch(() => {});

    const seedLockRef = doc(db, 'system', 'seed_status_v3');
    await setDoc(
      seedLockRef,
      {
        isSeeded: true,
        seededAt: serverTimestamp(),
        version: '3.1.0',
      },
      { merge: true }
    );

    isSeeding = false;
    return { success: true, message: 'Branch-wise plans structure initialized' };
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

        // If listening to 'plans', flatten regularPlans for backwards compatibility with all member views
        if (collectionName === 'plans') {
          let flatPlans = [];
          let hasBranchDoc = false;
          items.forEach((item) => {
            if (item.regularPlans && Array.isArray(item.regularPlans)) {
              hasBranchDoc = true;
              const bId = item.id === 'vijaynagar' ? 'branch2' : item.id;
              flatPlans.push(
                ...item.regularPlans.map((p) => ({
                  ...p,
                  branchId: p.branchId || bId,
                }))
              );
            }
          });

          if (hasBranchDoc) {
            onData(deduplicateById(flatPlans));
            return;
          }
        }

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
 * Adds or updates a membership plan inside branch document (plans/vishrambag or plans/vijaynagar).
 */
export async function savePlanToFirestore(plan) {
  if (!plan.id) {
    throw new Error('Plan ID is required');
  }
  const branchDoc = (plan.branchId === 'branch2' || plan.branchId === 'vijaynagar') ? 'vijaynagar' : 'vishrambag';
  const branchRef = doc(db, 'plans', branchDoc);

  const snap = await getDoc(branchRef).catch(() => null);
  let currentRegular = [];
  if (snap && snap.exists() && Array.isArray(snap.data()?.regularPlans)) {
    currentRegular = snap.data().regularPlans;
  } else {
    currentRegular = INITIAL_PLANS.filter((p) =>
      branchDoc === 'vijaynagar' ? (p.branchId === 'branch2' || p.branchId === 'vijaynagar') : p.branchId === 'vishrambag'
    );
  }

  const existingIdx = currentRegular.findIndex((p) => p.id === plan.id);
  let updatedRegular;
  if (existingIdx >= 0) {
    updatedRegular = [...currentRegular];
    updatedRegular[existingIdx] = { ...updatedRegular[existingIdx], ...plan };
  } else {
    updatedRegular = [...currentRegular, plan];
  }

  await setDoc(
    branchRef,
    {
      branchId: branchDoc === 'vijaynagar' ? 'branch2' : 'vishrambag',
      branchName: branchDoc === 'vijaynagar' ? 'Respire Vijaynagar Branch (Krishna Heights)' : 'Respire Vishrambag Branch (R City Mall)',
      regularPlans: updatedRegular,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return plan;
}

/**
 * Deletes a membership plan from branch document regularPlans.
 */
export async function deletePlanFromFirestore(planId, branchId) {
  const branchesToSearch = branchId
    ? [(branchId === 'branch2' || branchId === 'vijaynagar') ? 'vijaynagar' : 'vishrambag']
    : ['vishrambag', 'vijaynagar'];

  for (const bDoc of branchesToSearch) {
    const branchRef = doc(db, 'plans', bDoc);
    const snap = await getDoc(branchRef).catch(() => null);
    if (snap && snap.exists() && Array.isArray(snap.data()?.regularPlans)) {
      const filtered = snap.data().regularPlans.filter((p) => p.id !== planId);
      if (filtered.length !== snap.data().regularPlans.length) {
        await setDoc(branchRef, { regularPlans: filtered, updatedAt: serverTimestamp() }, { merge: true });
      }
    }
  }
}

/**
 * Saves special personal training (PT) plans directly to plans/vishrambag or plans/vijaynagar.
 */
export async function saveBranchSpecialPlans(branchId, specialPlans) {
  const branchDoc = (branchId === 'branch2' || branchId === 'vijaynagar') ? 'vijaynagar' : 'vishrambag';
  const branchRef = doc(db, 'plans', branchDoc);
  await setDoc(
    branchRef,
    {
      specialPlans,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
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

/**
 * =========================================================================
 * TRAINER DASHBOARD: SESSIONS, WORKOUT NOTES & PROFILE OPERATIONS
 * =========================================================================
 */

/**
 * Saves or updates a personal training session in Firestore.
 */
export async function saveTrainerSessionToFirestore(session) {
  if (!session.id) {
    session.id = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  }
  const sessionRef = doc(db, 'trainer_sessions', session.id);
  const payload = {
    ...session,
    updatedAt: serverTimestamp(),
  };
  await setDoc(sessionRef, payload, { merge: true });
  return payload;
}

/**
 * Updates session status (e.g. 'Scheduled', 'In Progress', 'Completed', 'Cancelled').
 */
export async function updateTrainerSessionStatusInFirestore(sessionId, status) {
  const sessionRef = doc(db, 'trainer_sessions', sessionId);
  await setDoc(sessionRef, { status, updatedAt: serverTimestamp() }, { merge: true });
}

/**
 * Deletes a training session.
 */
export async function deleteTrainerSessionFromFirestore(sessionId) {
  const sessionRef = doc(db, 'trainer_sessions', sessionId);
  await deleteDoc(sessionRef);
}

/**
 * Saves a workout / session note for an assigned member.
 */
export async function saveTrainerNoteToFirestore(note) {
  if (!note.id) {
    note.id = `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  }
  const noteRef = doc(db, 'trainer_notes', note.id);
  const payload = {
    ...note,
    createdAt: note.createdAt || new Date().toISOString(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(noteRef, payload, { merge: true });
  return payload;
}

/**
 * Deletes a session note.
 */
export async function deleteTrainerNoteFromFirestore(noteId) {
  const noteRef = doc(db, 'trainer_notes', noteId);
  await deleteDoc(noteRef);
}

/**
 * Allows an authenticated trainer to update permitted personal details (phone, bio, specialty, photo).
 * Role or account permissions can NEVER be altered through this method.
 */
export async function updateTrainerProfileInFirestore(trainerId, updates) {
  const safeUpdates = {
    ...(updates.name ? { name: updates.name.trim() } : {}),
    ...(updates.shifts !== undefined ? { shifts: updates.shifts } : {}),
    phone: updates.phone !== undefined ? updates.phone : '',
    bio: updates.bio !== undefined ? updates.bio : '',
    specialty: updates.specialty !== undefined ? updates.specialty : '',
    experience: updates.experience !== undefined ? updates.experience : '',
    photo: updates.photo !== undefined ? updates.photo : '',
    updatedAt: serverTimestamp(),
  };
  const trRef = doc(db, 'trainers', trainerId);
  await setDoc(trRef, safeUpdates, { merge: true });
  return safeUpdates;
}

/**
 * Saves a member progress tracking record in Firestore.
 * Always creates a new historical record to preserve historical progress.
 */
export async function saveMemberProgressToFirestore(progress) {
  if (!progress.id) {
    progress.id = `prog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  }
  const progRef = doc(db, 'member_progress', progress.id);
  const payload = {
    ...progress,
    createdAt: progress.createdAt || new Date().toISOString(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(progRef, payload, { merge: true });

  // Update member document with latest stats snapshot if memberId is present
  if (progress.memberId) {
    const memRef = doc(db, 'members', progress.memberId);
    const memberUpdates = {};
    if (progress.weight !== undefined && progress.weight !== '') memberUpdates.weight = Number(progress.weight);
    if (progress.height !== undefined && progress.height !== '') memberUpdates.height = Number(progress.height);
    if (progress.bmi !== undefined && progress.bmi !== '') memberUpdates.bmi = Number(progress.bmi);
    if (progress.fitnessGoals) memberUpdates.fitnessGoals = progress.fitnessGoals;
    if (progress.measurements) memberUpdates.latestMeasurements = progress.measurements;
    memberUpdates.lastProgressDate = progress.date || new Date().toISOString().split('T')[0];
    memberUpdates.updatedAt = serverTimestamp();
    await setDoc(memRef, memberUpdates, { merge: true }).catch(() => {});
  }

  return payload;
}

/**
 * Deletes a member progress record.
 */
export async function deleteMemberProgressFromFirestore(progressId) {
  const progRef = doc(db, 'member_progress', progressId);
  await deleteDoc(progRef);
}


