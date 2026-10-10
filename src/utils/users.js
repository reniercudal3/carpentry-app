import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Save (or update) a user profile in Firestore.
 * Uses merge:true so it is idempotent — safe to call on every registration.
 */
export async function saveUserProfile(uid, displayName, email) {
  const ref = doc(db, 'users', uid);
  await setDoc(ref, {
    uid,
    displayName,
    email,
    createdAt: new Date().toISOString(),
  }, { merge: true });
}

/**
 * Batch-fetch user profiles by UID array.
 * Returns a plain object map: { [uid]: { uid, displayName, email, createdAt } }
 * UIDs with no Firestore doc get a fallback entry.
 */
export async function getUserProfiles(uids) {
  if (!uids || uids.length === 0) return {};
  const profileMap = {};
  await Promise.all(
    uids.map(async (uid) => {
      const ref = doc(db, 'users', uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        profileMap[uid] = snap.data();
      } else {
        profileMap[uid] = { uid, displayName: null, email: null, createdAt: null };
      }
    })
  );
  return profileMap;
}
