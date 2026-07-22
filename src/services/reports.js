import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase.js';

export async function generateClassReport(className) {
  const usersSnap = await getDocs(
    query(collection(db, 'users'), where('className', '==', className))
  );
  const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const readingsSnap = await getDocs(
    query(collection(db, 'readings'), where('className', '==', className))
  );
  const readings = readingsSnap.docs.map(d => d.data());

  const approved = readings.filter(r => r.status === 'approved').length;
  const rejected = readings.filter(r => r.status === 'rejected').length;
  const pending = readings.filter(r => r.status === 'pending').length;

  const totalXp = users
    .filter(u => u.role === 'student')
    .reduce((sum, u) => sum + (u.xp || 0), 0);

  const studentCount = users.filter(u => u.role === 'student').length;
  const totalBooks = users
    .filter(u => u.role === 'student')
    .reduce((sum, u) => sum + (u.booksRead || 0), 0);

  return {
    className,
    studentCount,
    totalBooks,
    totalXp,
    approvedReadings: approved,
    rejectedReadings: rejected,
    pendingReadings: pending,
    avgXpPerStudent: studentCount > 0 ? Math.round(totalXp / studentCount) : 0,
    avgBooksPerStudent: studentCount > 0 ? (totalBooks / studentCount).toFixed(1) : 0
  };
}

export async function generateSchoolReport() {
  const usersSnap = await getDocs(collection(db, 'users'));
  const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const classes = [...new Set(users.map(u => u.className).filter(Boolean))];
  const classReports = [];

  for (const c of classes) {
    classReports.push(await generateClassReport(c));
  }

  return classReports;
}

export function toCSV(data) {
  if (!data.length) return '';

  const headers = Object.keys(data[0]);
  const lines = data.map(row =>
    headers.map(h => {
      const val = row[h]?.toString() || '';
      return val.includes(',') ? `"${val}"` : val;
    }).join(',')
  );

  return [headers.join(','), ...lines].join('\n');
}

export function downloadFile(content, filename, type = 'text/csv') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
