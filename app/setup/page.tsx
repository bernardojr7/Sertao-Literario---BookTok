'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';

export default function SetupPage() {
  const [status, setStatus] = useState('');
  const [done, setDone] = useState(false);

  const seed = async () => {
    setStatus('Criando escola...');
    const escolasSnap = await getDocs(collection(db, 'escolas'));
    let escolaId: string;
    if (escolasSnap.empty) {
      const ref = await addDoc(collection(db, 'escolas'), {
        nome: 'Escola Estadual Professora Maria Das Graças Silva Germano',
        endereco: '',
        dataCriacao: new Date(),
      });
      escolaId = ref.id;
    } else {
      escolaId = escolasSnap.docs[0].id;
    }

    setStatus('Criando turmas...');
    const turmas = ['5º Ano', '6º Ano', '7º Ano', '8º Ano', '9º Ano'];
    for (const nome of turmas) {
      const q = query(
        collection(db, 'turmas'),
        where('nome', '==', nome),
        where('escolaId', '==', escolaId)
      );
      const existing = await getDocs(q);
      if (existing.empty) {
        await addDoc(collection(db, 'turmas'), {
          escolaId,
          nome,
          anoLetivo: 2026,
          dataCriacao: new Date(),
        });
      }
    }

    setStatus('✅ Setup concluído! Você já pode criar contas.');
    setDone(true);
  };

  return (
    
      
        🌵


        <h1 className="text-xl font-bold mb-2">Configuração Inicial</h1>
        
          Clique abaixo para criar a escola e as turmas no banco de dados.
        


        <button
          onClick={seed}
          disabled={done}
          className="px-6 py-3 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 disabled:opacity-50"
        >
          {done ? 'Concluído' : 'Configurar Banco'}
        </button>
        {status && (
          
            {status}
          


        )}
        {done && (
          <a
            href="/login"
            className="block mt-4 text-amber-600 font-medium hover:underline"
          >
            Ir para login →
          </a>
        )}
      


    


  );
}
