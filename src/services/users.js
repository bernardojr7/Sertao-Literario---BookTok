import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase.js';

export async function createUserProfile(uid, data) {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    xp: 0,
    cactoscoins: 0,
    level: 1,
    booksRead: 0,
    isActive: true,
    createdAt: new Date().toISOString()
  });
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateUserProfile(uid, data) {
  await updateDoc(doc(db, 'users', uid), data);
}

export async function deleteUserProfile(uid) {
  await deleteDoc(doc(db, 'users', uid));
}

export async function listUsersByRole(role) {
  const q = query(collection(db, 'users'), where('role', '==', role));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function listUsersByClass(className) {
  const q = query(collection(db, 'users'), where('className', '==', className));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getRanking(className, max = 5) {
  const q = query(
    collection(db, 'users'),
    where('className', '==', className),
    where('role', '==', 'student'),
    orderBy('xp', 'desc'),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d, i) => ({ position: i + 1, id: d.id, ...d.data() }));
}
