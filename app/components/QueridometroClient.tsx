"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import QueridometroChart from './QueridometroChart';

const EMOJIS = ["❤️", "🧩", "🍪", "🌱", "🤢", "🎯", "🏳️‍🌈", "🤥", "💼"];

export default function QueridometroClient({ users }: { users: any[] }) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [myVotes, setMyVotes] = useState<Record<string, string>>({}); 
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('queridometro_user');
    if (!saved) {
      router.push('/auth');
    } else {
      const user = JSON.parse(saved);
      setCurrentUser(user);
      loadDashboard(user.id);
    }
  }, [router]);

  const loadDashboard = async (userId: string) => {
    try {
      const [summaryRes, votesRes] = await Promise.all([
        fetch(`/api/votes/summary?userId=${userId}`),
        fetch(`/api/votes/me?senderId=${userId}`)
      ]);
      if (summaryRes.ok) setChartData(await summaryRes.json());
      if (votesRes.ok) setMyVotes(await votesRes.json());
    } catch (error) { console.error(error); }
  };

  const handleVote = async (receiverId: string, emoji: string) => {
    const originalVotes = { ...myVotes };
    setMyVotes(prev => ({ ...prev, [receiverId]: emoji }));
    const res = await fetch('/api/vote', {
      method: 'POST',
      body: JSON.stringify({ receiverId, emoji, senderId: currentUser.id }),
    });
    if (!res.ok) {
      alert("Erro ao computar voto.");
      setMyVotes(originalVotes);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-12 animate-enter pb-24">
      
      {/* SEÇÃO HERO: Perfil e Gráfico */}
      {/* Ajuste de Proporção: Largura máxima contida para leitura confortável */}
      <section className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-zinc-900/40 p-8 md:p-12 shadow-2xl backdrop-blur-xl">
        {/* Efeito de luz ambiente */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row gap-8 md:items-start">
          
          {/* Coluna Esquerda: Identidade */}
          <div className="flex flex-col items-center md:items-start md:w-1/3 space-y-4">
            <Link href="/profile" className="group relative">
              <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-zinc-800 shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:border-zinc-600">
                <img 
                  src={currentUser.image || `https://ui-avatars.com/api/?name=${currentUser.name}`} 
                  alt="Perfil" 
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-zinc-800 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white opacity-0 transition-opacity group-hover:opacity-100">
                Editar
              </div>
            </Link>
            
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold tracking-tight text-white">
                {currentUser.name}
              </h2>
              <p className="text-sm font-medium uppercase tracking-widest text-zinc-500">
                Dashboard Diário
              </p>
            </div>

            {/* Micro-stats (Contagem rápida) */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-2">
               {chartData.slice(0, 3).map((d) => (
                 <div key={d.emoji} className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-sm border border-white/5">
                    <span>{d.emoji}</span>
                    <span className="font-bold text-zinc-200">{d.count}</span>
                 </div>
               ))}
            </div>
          </div>
          
          {/* Coluna Direita: Gráfico */}
          <div className="flex-1 w-full min-h-[200px] border-t md:border-t-0 md:border-l border-white/5 md:pl-8 pt-8 md:pt-0">
             <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-zinc-500">
               Visão Geral de Reações
             </h3>
             <QueridometroChart data={chartData} />
          </div>
        </div>
      </section>

      {/* SEÇÃO LISTA: Grid Responsivo Profissional */}
      <section>
        <div className="mb-6 flex items-center justify-between px-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            Membros ({users.length - 1})
          </h3>
          <span className="h-px flex-1 bg-zinc-800 ml-4"></span>
        </div>
        
        {/* GRID: 1 col (mobile), 2 col (tablet), 3 col (desktop) */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.filter(u => u.id !== currentUser.id).map(user => (
            <div 
              key={user.id} 
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/30 p-5 transition-all duration-300 hover:border-white/10 hover:bg-zinc-900/60"
            >
              <div className="flex items-center gap-4 mb-5">
                <img 
                  src={user.image || `https://ui-avatars.com/api/?name=${user.name}`} 
                  alt={user.name}
                  className="h-12 w-12 rounded-full border border-white/10 object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-zinc-200 group-hover:text-white transition-colors">
                    {user.name}
                  </p>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                    Disponível
                  </p>
                </div>
              </div>

              {/* Área de Ação */}
              <div className="mt-auto">
                {myVotes[user.id] ? (
                  <div className="flex h-12 w-full items-center justify-center rounded-xl bg-green-500/10 border border-green-500/20 text-2xl animate-in zoom-in duration-300">
                    {myVotes[user.id]}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {EMOJIS.map(emoji => (
                      <button 
                        key={emoji} 
                        onClick={() => handleVote(user.id, emoji)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-lg transition-all hover:scale-110 hover:bg-white/10 hover:text-white focus:ring-2 focus:ring-zinc-700 active:scale-95"
                        title={`Enviar ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-20 flex justify-center border-t border-white/5 pt-8">
        <button 
          onClick={() => { localStorage.removeItem('queridometro_user'); router.push('/auth'); }}
          className="rounded-full px-6 py-2 text-xs font-bold uppercase tracking-widest text-zinc-500 transition-colors hover:bg-white/5 hover:text-red-400"
        >
          Encerrar Sessão
        </button>
      </footer>
    </div>
  );
}