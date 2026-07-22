import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase.js';

export async function createMission(data) {
  return addDoc(collection(db, 'missions'), {
    ...data,
    isActive: true,
    createdAt: new Date().toISOString()
  });
}

export async function updateMission(id, data) {
  await updateDoc(doc(db, 'missions', id), data);
}

export async function deleteMission(id) {
  await deleteDoc(doc(db, 'missions', id));
}

export async function listMissions(className) {
  const q = query(
    collection(db, 'missions'),
    where('className', '==', className),
    where('isActive', '==', true),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function completeMission(missionId, data) {
  return addDoc(collection(db, 'missionCompletions'), {
    missionId,
    ...data,
    status: 'pending',
    createdAt: new Date().toISOString()
  });
}

export async function approveMissionCompletion(id, approvedBy) {
  await updateDoc(doc(db, 'missionCompletions', id), {
    status: 'approved',
    approvedBy,
    approvedAt: new Date().toISOString()
  });
}
