'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { loginStudent, loginStaff } from '@/lib/firebase/auth';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import type { Turma } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const { usuario, loading } = useAuth();
  const [tab, setTab] = useState<'aluno' | 'staff'>('aluno');
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [turmaId, setTurmaId] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (!loading && usuario) router.push('/home');
  }, [usuario, loading, router]);

  useEffect(() => {
    const fetchTurmas = async () => {
      const q = query(collection(db, 'turmas'), orderBy('nome'));
      const snap = await getDocs(q);
      setTurmas(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Turma));
    };
    fetchTurmas();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      if (tab === 'aluno') {
        if (!turmaId || !nome.trim() || !pin)
          throw new Error('Preencha todos os campos.');
        await loginStudent(turmaId, nome.trim(), pin);
      } else {
        if (!email.trim() || !pin)
          throw new Error('Preencha todos os campos.');
        await loginStaff(email.trim(), pin);
      }
      router.push('/home');
    } catch (err: any) {
      setErro(err.message || 'Erro ao entrar.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    
      
        🌵


        <h1 className="text-2xl font-bold text-amber-600 dark:text-amber-400">
          Sertão Literário
        </h1>
        
          Leitura, comunidade e conquistas
        


      



      
        <button
          onClick={() => setTab('aluno')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === 'aluno'
              ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm'
              : 'text-slate-500'
          }`}
        >
          👨‍🎓 Sou Aluno
        </button>
        <button
          onClick={() => setTab('staff')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === 'staff'
              ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm'
              : 'text-slate-500'
          }`}
        >
          👩‍🏫 Professor / Coord.
        </button>
      



      <form onSubmit={handleLogin} className="space-y-4">
        {tab === 'aluno' ? (
          <>
            
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                Sua Turma
              </label>
              <select
                value={turmaId}
                onChange={(e) => setTurmaId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-amber-400 outline-none"
              >
                <option value="">Selecione sua turma</option>
                {turmas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome} ({t.anoLetivo})
                  </option>
                ))}
              </select>
            


            
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                Nome Completo
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Maria Silva"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-amber-400 outline-none"
              />
            


          </>
        ) : (
          
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-amber-400 outline-none"
            />
          


        )}

        
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
            Senha (6 dígitos)
          </label>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="••••••"
            inputMode="numeric"
            maxLength={6}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-amber-400 outline-none tracking-widest text-center text-lg"
          />
        



        {erro && (
          
            {erro}
          


        )}

        <button
          type="submit"
          disabled={carregando}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all disabled:opacity-50"
        >
          {carregando ? 'Entrando...' : 'Entrar 🌵'}
        </button>
      </form>

      
        Não tem conta?{' '}
        <button
          onClick={() => router.push('/cadastro')}
          className="text-amber-600 dark:text-amber-400 font-medium hover:underline"
        >
          Criar conta
        </button>
      


    


  );
}
