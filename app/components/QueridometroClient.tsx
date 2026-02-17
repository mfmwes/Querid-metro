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
    } catch (error) {
      console.error("Erro ao carregar dados", error);
    }
  };

  const handleVote = async (receiverId: string, emoji: string) => {
    // 1. Atualização Otimista: Trava a tela instantaneamente
    const originalVotes = { ...myVotes };
    setMyVotes(prev => ({ ...prev, [receiverId]: emoji }));

    // 2. Envia para o servidor
    const res = await fetch('/api/vote', {
      method: 'POST',
      body: JSON.stringify({ receiverId, emoji, senderId: currentUser.id }),
    });

    if (!res.ok) {
      alert("Erro! Você provavelmente já votou hoje.");
      setMyVotes(originalVotes); // Desfaz a trava se o servidor rejeitar
    }
  };

  if (!currentUser) return <div className="text-center py-20 text-zinc-500">Carregando...</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* SEÇÃO 1: MEU STATUS (Com Link para Perfil) */}
      <section className="bg-zinc-900/50 p-8 rounded-[2.5rem] border border-zinc-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col items-center mb-8 relative z-10">
          
          {/* Link que envolve a Foto e o Nome */}
          <Link href="/profile" className="group flex flex-col items-center">
            <div className="relative">
              <img 
                src={currentUser.image || `https://ui-avatars.com/api/?name=${currentUser.name}&background=random`} 
                alt="Meu Perfil" 
                className="w-24 h-24 rounded-full border-4 border-zinc-800 shadow-lg object-cover mb-4 cursor-pointer group-hover:border-zinc-500 group-hover:scale-105 transition-all"
              />
              {/* Overlay de "Editar" que aparece ao passar o mouse */}
              <div className="absolute inset-0 mb-4 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Editar</span>
              </div>
            </div>
            
            <h2 className="text-2xl font-black text-white tracking-tight group-hover:text-zinc-300 transition-colors text-center">
              {currentUser.name}
            </h2>
          </Link>

          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Suas reações hoje</p>
        </div>
        
        <div className="relative z-10">
          <QueridometroChart data={chartData} />
          
          {/* Contagem de Emojis abaixo do gráfico */}
          {chartData.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {chartData.map((data) => (
                <div key={data.emoji} className="flex items-center gap-2 bg-zinc-800/80 px-4 py-2 rounded-xl border border-zinc-700">
                  <span className="text-2xl">{data.emoji}</span>
                  <span className="text-white font-bold text-lg">{data.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SEÇÃO 2: LISTA DE COLEGAS E VOTAÇÃO */}
      <section className="space-y-6">
        <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest ml-4">Interagir com a Galera</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.filter(u => u.id !== currentUser.id).map(user => (
            <div key={user.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between hover:border-zinc-600 transition-all group gap-4">
              
              {/* Infos do Usuário */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <img 
                  src={user.image || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                  alt={user.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-zinc-800 group-hover:border-zinc-500 transition-colors"
                />
                <span className="font-bold text-lg text-zinc-300 group-hover:text-white transition-colors truncate max-w-[120px]">
                  {user.name.split(' ')[0]}
                </span>
              </div>

              {/* ÁREA DE VOTO */}
              <div className="flex-1 flex justify-end w-full sm:w-auto">
                {myVotes[user.id] ? (
                  // SE JÁ VOTOU: Mostra o emoji travado
                  <div className="flex flex-col items-center animate-in zoom-in duration-300 bg-black/30 p-2 rounded-xl border border-zinc-800/50 w-full sm:w-auto">
                    <span className="text-4xl" role="img">{myVotes[user.id]}</span>
                    <span className="text-[9px] uppercase font-bold text-zinc-500 mt-1">Enviado</span>
                  </div>
                ) : (
                  // SE NÃO VOTOU: Mostra lista com quebra de linha (flex-wrap)
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
                    {EMOJIS.map(emoji => (
                      <button 
                        key={emoji} 
                        onClick={() => handleVote(user.id, emoji)}
                        className="text-2xl p-2 bg-zinc-800 rounded-xl hover:bg-zinc-700 hover:scale-110 transition-all active:scale-90"
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

      <footer className="text-center border-t border-zinc-900 pt-10">
        <button 
          onClick={() => { localStorage.removeItem('queridometro_user'); router.push('/auth'); }}
          className="text-zinc-600 text-xs font-bold uppercase hover:text-red-500 transition-colors"
        >
          Sair da Conta
        </button>
      </footer>
    </div>
  );
}