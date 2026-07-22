import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy, runTransaction } from 'firebase/firestore';
import { db } from '../firebase.js';

export async function addStoreItem(data) {
  return addDoc(collection(db, 'storeItems'), {
    ...data,
    isActive: true,
    createdAt: new Date().toISOString()
  });
}

export async function updateStoreItem(id, data) {
  await updateDoc(doc(db, 'storeItems', id), data);
}

export async function deleteStoreItem(id) {
  await updateDoc(doc(db, 'storeItems', id), { isActive: false });
}

export async function listStoreItems() {
  const q = query(collection(db, 'storeItems'), where('isActive', '==', true));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function purchaseItem(userId, itemId, price, requiredXp) {
  await runTransaction(db, async (transaction) => {
    const userRef = doc(db, 'users', userId);
    const itemRef = doc(db, 'storeItems', itemId);

    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists()) throw new Error('Usuário não encontrado');

    const user = userSnap.data();
    if ((user.cactoscoins || 0) < price) throw new Error('Cactoscoins insuficientes');
    if ((user.xp || 0) < requiredXp) throw new Error('XP insuficiente');

    transaction.update(userRef, {
      cactoscoins: (user.cactoscoins || 0) - price
    });

    const purchaseRef = doc(collection(db, 'purchases'));
    transaction.set(purchaseRef, {
      userId,
      itemId,
      price,
      createdAt: new Date().toISOString()
    });
  });
}

export async function getUserPurchases(userId) {
  const q = query(
    collection(db, 'purchases'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
