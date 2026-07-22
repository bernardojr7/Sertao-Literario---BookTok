import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase.js';

export async function addBook(data) {
  return addDoc(collection(db, 'books'), {
    ...data,
    isActive: true,
    createdAt: new Date().toISOString()
  });
}

export async function updateBook(id, data) {
  await updateDoc(doc(db, 'books', id), data);
}

export async function deleteBook(id) {
  await deleteDoc(doc(db, 'books', id));
}

export async function getBook(id) {
  const snap = await getDoc(doc(db, 'books', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function listBooks() {
  const q = query(collection(db, 'books'), where('isActive', '==', true), orderBy('title'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function searchBooks(term) {
  const all = await listBooks();
  const t = term.toLowerCase();
  return all.filter(b =>
    b.title?.toLowerCase().includes(t) ||
    b.author?.toLowerCase().includes(t)
  );
}
