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
  createdAt: string;
};

export default function QueridometroClient({ users }: { users: User[] }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [votesSent, setVotesSent] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Carrega o usuário atual do localStorage e busca os votos dele
  useEffect(() => {
    const userStr = localStorage.getItem('queridometro_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      
      // Busca os votos já enviados por este usuário para fazer a checagem
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

  // --- 2. LÓGICA DE FUSO HORÁRIO (AMERICA/FORTALEZA) ---
  const hasVotedToday = (dateString: string) => {
    if (!dateString) return false;
    
    const voteDate = new Date(dateString);
    const now = new Date();

    // Força o front-end a formatar as duas datas no fuso do Ceará
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Fortaleza',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    const todayLocal = formatter.format(now);
    const voteDateLocal = formatter.format(voteDate);

    // Retorna true se a data do voto for igual a data de hoje (no fuso local)
    return todayLocal === voteDateLocal;
  };

  // Função para enviar o voto
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

      // Adiciona o voto recém-criado na lista local para bloquear o botão na hora
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
      
      {/* SEÇÃO DOS MEMBROS */}
      <div>
        <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">
          Membros ({users.length - 1})
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users
            .filter(u => u.id !== currentUser.id) // Não mostra o próprio usuário na lista de votação
            .map(user => {
              
              // 3. VERIFICA SE JÁ VOTOU HOJE USANDO A FUNÇÃO DE FUSO HORÁRIO
              const jaVotou = votesSent.some(vote => 
                vote.receiverId === user.id && hasVotedToday(vote.createdAt)
              );

              return (
                <div key={user.id} className="bg-[#111] border border-zinc-800 rounded-2xl p-4 flex flex-col gap-4">
                  
                  {/* Info do Usuário */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                      {user.image ? (
                        <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-zinc-500 uppercase">
                          {user.name?.substring(0, 2)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-white font-bold">{user.name}</h4>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                        {jaVotou ? 'VOTO REGISTRADO' : 'DISPONÍVEL'}
                      </p>
                    </div>
                  </div>

                  {/* Área de Votação */}
                  <div className="bg-[#0a0a0a] border border-zinc-800/50 rounded-xl p-3 min-h-[60px] flex items-center justify-center">
                    {jaVotou ? (
                      <span className="text-xs text-zinc-600 font-bold uppercase tracking-widest">
                        Aguarde até as 00:00
                      </span>
                    ) : selectedUser === user.id ? (
                      <div className="flex flex-col w-full gap-3">
                        {/* Grid de Emojis */}
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