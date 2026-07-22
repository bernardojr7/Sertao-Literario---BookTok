import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  query,
  where,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './config';
import type { Usuario, Role, MetaTipo } from '@/types';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '.');
}

export async function registerStudent(
  turmaId: string,
  nomeCompleto: string,
  pin: string,
  metas: { bimestral: number; semestral: number; anual: number }
): Promise<void> {
  const slug = slugify(nomeCompleto);
  const generatedEmail = `aluno.${slug}.${turmaId.slice(0, 8)}@sertao.app`;

  const dupQuery = query(
    collection(db, 'alunos_turma'),
    where('turmaId', '==', turmaId),
    where('nomeCompleto', '==', nomeCompleto)
  );
  const existing = await getDocs(dupQuery);
  if (!existing.empty) {
    throw new Error('Já existe um aluno com esse nome nesta turma.');
  }

  const cred = await createUserWithEmailAndPassword(auth, generatedEmail, pin);
  await updateProfile(cred.user, { displayName: nomeCompleto });

  const userData: Omit<Usuario, 'uid'> = {
    nomeCompleto,
    email: generatedEmail,
    role: 'ALUNO',
    booktokHandle: `@${slug}`,
    xp: 0,
    cactoscoins: 0,
    nivel: 1,
    ativo: true,
    dataCriacao: new Date(),
    dataAtualizacao: new Date(),
  };
  await setDoc(doc(db, 'usuarios', cred.user.uid), userData);

  await addDoc(collection(db, 'alunos_turma'), {
    usuarioId: cred.user.uid,
    turmaId,
    nomeCompleto,
    ativo: true,
    dataVinculo: serverTimestamp(),
  });

  const metasData: { tipo: MetaTipo; quantidade: number }[] = [
    { tipo: 'BIMESTRAL', quantidade: metas.bimestral },
    { tipo: 'SEMESTRAL', quantidade: metas.semestral },
    { tipo: 'ANUAL', quantidade: metas.anual },
  ];
  for (const meta of metasData) {
    await addDoc(collection(db, 'metas_leitura'), {
      usuarioId: cred.user.uid,
      tipo: meta.tipo,
      quantidadeLivros: meta.quantidade,
      dataDefinicao: serverTimestamp(),
    });
  }
}

export async function loginStudent(
  turmaId: string,
  nomeCompleto: string,
  pin: string
): Promise<void> {
  const q = query(
    collection(db, 'alunos_turma'),
    where('turmaId', '==', turmaId),
    where('nomeCompleto', '==', nomeCompleto)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    throw new Error('Aluno não encontrado nesta turma. Verifique nome e turma.');
  }

  const alunoData = snapshot.docs[0].data();
  const userDoc = await getDoc(doc(db, 'usuarios', alunoData.usuarioId));
  if (!userDoc.exists()) {
    throw new Error('Conta não encontrada.');
  }

  const usuario = userDoc.data() as Usuario;
  await signInWithEmailAndPassword(auth, usuario.email, pin);
}

export async function registerProfessor(
  email: string,
  codigoSeguranca: string,
  turmas: string[],
  pin: string
): Promise<void> {
  if (codigoSeguranca !== process.env.NEXT_PUBLIC_PROF_CODE) {
    throw new Error('Código de segurança inválido.');
  }

  const cred = await createUserWithEmailAndPassword(auth, email, pin);
  const nomeDisplay = email.split('@')[0];

  await setDoc(doc(db, 'usuarios', cred.user.uid), {
    nomeCompleto: nomeDisplay,
    email,
    role: 'PROFESSOR',
    booktokHandle: `@${slugify(nomeDisplay)}`,
    xp: 0,
    cactoscoins: 0,
    nivel: 1,
    ativo: true,
    dataCriacao: new Date(),
    dataAtualizacao: new Date(),
  });

  for (const turmaId of turmas) {
    await addDoc(collection(db, 'professores_turma'), {
      usuarioId: cred.user.uid,
      turmaId,
      ativo: true,
      dataVinculo: serverTimestamp(),
    });
  }
}

export async function registerCoordenador(
  email: string,
  codigoSeguranca: string,
  pin: string,
  escolaId: string
): Promise<void> {
  if (codigoSeguranca !== process.env.NEXT_PUBLIC_COORD_CODE) {
    throw new Error('Código master inválido.');
  }

  const cred = await createUserWithEmailAndPassword(auth, email, pin);
  const nomeDisplay = email.split('@')[0];

  await setDoc(doc(db, 'usuarios', cred.user.uid), {
    nomeCompleto: nomeDisplay,
    email,
    role: 'COORDENADOR',
    booktokHandle: `@${slugify(nomeDisplay)}`,
    xp: 0,
    cactoscoins: 0,
    nivel: 1,
    ativo: true,
    dataCriacao: new Date(),
    dataAtualizacao: new Date(),
  });

  await addDoc(collection(db, 'coordenadores_escola'), {
    usuarioId: cred.user.uid,
    escolaId,
    dataVinculo: serverTimestamp(),
  });
}

export async function loginStaff(email: string, pin: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, pin);
}

export async function logout(): Promise<void> {
  await signOut(auth);
}
