// Run once: call setAdminByEmail("teacher@example.com") from browser console or a one-off script
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { addAdmin } from './admin';

/**
 * Promote a user to admin by their registered email address.
 * Looks up the users collection for a matching email, then writes to admins collection.
 */
export async function setAdminByEmail(email) {
  const q = query(collection(db, 'users'), where('email', '==', email));
  const snap = await getDocs(q);
  if (snap.empty) {
    throw new Error('User not found with email: ' + email);
  }
  const uid = snap.docs[0].data().uid;
  await addAdmin(uid, 'system', 'Admin');
  return uid;
}
