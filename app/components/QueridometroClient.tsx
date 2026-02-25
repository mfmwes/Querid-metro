"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 1. LISTA DE EMOJIS ATUALIZADA
const EMOJIS = ["❤️", "💣", "🍪", "🌱", "🤢", "🎯", "💔", "🤥", "💼", "🐍", "🤬", "🍌"];

type User = {
  id: string;
  name: string;
  image: string | null;
};

type Vote = {
  id: string;
  receiverId: string;
  emoji: string; // <-- Agora ele sabe qual emoji foi
  createdAt: string;
};

export default function QueridometroClient({ users }: { users: User[] }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [votesSent, setVotesSent] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('queridometro_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      
      // Busca a lista de votos atualizada quando a página recarrega
      fetch(`/api/user/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.votesSent) {
            setVotesSent(data.votesSent);
          }
        })
        .catch(err => console.error("Erro ao carregar votos:", err));
    } else {
      router.push('/auth');
    }
  }, [router]);

  const hasVotedToday = (dateString: string) => {
    if (!dateString) return false;
    
    const voteDate = new Date(dateString);
    const now = new Date();

    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Fortaleza',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    return formatter.format(now) === formatter.format(voteDate);
  };

  const handleVote = async (receiverId: string, emoji: string) => {
    if (!currentUser) return;
    setLoading(true);

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          receiverId,
          emoji,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Erro ao registrar voto.');
        setLoading(false);
        return;
      }

      // Adiciona o voto na tela na mesma hora
      setVotesSent(prev => [...prev, data]);
      setSelectedUser(null);
      router.refresh();

    } catch (error) {
      console.error(error);
      alert('Erro ao processar voto.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">
          Membros ({users.length - 1})
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users
            .filter(u => u.id !== currentUser.id)
            .map(user => {
              
              // Verifica se votou E qual foi o emoji
              const votoDeHoje = votesSent.find(vote => 
                vote.receiverId === user.id && hasVotedToday(vote.createdAt)
              );

              return (
                <div key={user.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-4 shadow-lg">
                  
                  <div className="flex items-center justify-between gap-3 w-full">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 border border-zinc-700">
                      {user.image ? (
                        <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-zinc-500 uppercase">
                          {user.name?.substring(0, 2)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                       <h4 className="text-white font-bold text-lg truncate">{user.name}</h4>
                       <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                         {votoDeHoje ? 'VOTO REGISTRADO' : 'DISPONÍVEL'}
                       </p>
                    </div>

                    <button 
                      onClick={() => router.push(`/profile/${user.id}`)}
                      className="shrink-0 text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors uppercase font-bold"
                      title="Ver Dashboard do Dia"
                    >
                      Ver Emojis
                    </button>
                  </div>

                  <div className="bg-black border border-zinc-800 rounded-xl p-3 min-h-[60px] flex items-center justify-center">
                    {/* Renderiza o card bloqueado com o emoji que a pessoa escolheu */}
                    {votoDeHoje ? (
                      <div className="flex items-center gap-3 bg-zinc-900/50 px-4 py-2 rounded-lg border border-zinc-800">
                        <span className="text-2xl">{votoDeHoje.emoji}</span>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                          Enviado hoje
                        </span>
                      </div>
                    ) : selectedUser === user.id ? (
                      <div className="flex flex-col w-full gap-3">
                        <div className="flex flex-wrap justify-center gap-3">
                          {EMOJIS.map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => handleVote(user.id, emoji)}
                              disabled={loading}
                              className="text-2xl hover:scale-125 hover:-translate-y-1 transition-all disabled:opacity-50"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                        <button 
                          onClick={() => setSelectedUser(null)}
                          className="text-[10px] text-zinc-500 hover:text-white font-bold uppercase tracking-wider transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedUser(user.id)}
                        className="w-full h-full text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
                      >
                        Avaliar
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}