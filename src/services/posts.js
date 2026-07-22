import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy, increment, getDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

export async function createPost(data) {
  return addDoc(collection(db, 'posts'), {
    ...data,
    likesCount: 0,
    commentsCount: 0,
    status: 'active',
    createdAt: new Date().toISOString()
  });
}

export async function deletePost(id) {
  await updateDoc(doc(db, 'posts', id), { status: 'deleted' });
}

export async function hardDeletePost(id) {
  await deleteDoc(doc(db, 'posts', id));
}

export async function likePost(id) {
  await updateDoc(doc(db, 'posts', id), {
    likesCount: increment(1)
  });
}

export async function listPosts(className) {
  const q = query(
    collection(db, 'posts'),
    where('className', '==', className),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function listAllPosts() {
  const q = query(
    collection(db, 'posts'),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
