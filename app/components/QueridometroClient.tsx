"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProfileChart from '@/app/components/ProfileChart'; 

const EMOJIS = ["❤️", "💣", "🍪", "🌱", "🤢", "🎯", "💔", "🤥", "💼", "🐍", "🤬", "🍌"];

type User = {
  id: string;
  name: string;
  image: string | null;
};

type Vote = {
  id: string;
  receiverId: string;
  emoji: string;
  createdAt: string;
};

export default function QueridometroClient({ users }: { users: User[] }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [votesSent, setVotesSent] = useState<Vote[]>([]);
  const [myDailyVotes, setMyDailyVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('queridometro_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      
      fetch(`/api/user/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.votesSent) {
            setVotesSent(data.votesSent);
          }
          
          if (data.votesReceived) {
            const formatter = new Intl.DateTimeFormat('en-CA', {
              timeZone: 'America/Fortaleza',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            });
            const todayLocal = formatter.format(new Date());
            
            const todaysVotes = data.votesReceived.filter((vote: any) => {
              const voteDateLocal = formatter.format(new Date(vote.createdAt));
              return voteDateLocal === todayLocal;
            });
            
            setMyDailyVotes(todaysVotes);
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

  const handleLogout = () => {
    localStorage.removeItem('queridometro_user');
    router.push('/auth');
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-10">
      
      {/* --- BARRA DO USUÁRIO LOGADO (DESIGN PREMIUM) --- */}
      <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        
        <div className="flex items-center gap-5 w-full md:w-auto">
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 border-2 border-zinc-700 shadow-inner">
            {currentUser.image ? (
              <img src={currentUser.image} alt={currentUser.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-black text-zinc-500 uppercase">
                {currentUser.name?.substring(0, 2)}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-black italic tracking-tighter text-white leading-none">
              {currentUser.name}
            </h2>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1.5">
              Sua Conta
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => router.push('/profile')}
            className="flex-1 md:flex-none bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md"
          >
            Editar Perfil
          </button>
          <button 
            onClick={handleLogout}
            className="flex-1 md:flex-none bg-transparent hover:bg-red-500 text-red-500 hover:text-white border border-red-500/30 hover:border-red-500 text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition-all"
          >
            Sair
          </button>
        </div>
      </div>

      {/* --- SEU DASHBOARD PÚBLICO --- */}
      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 relative z-10 gap-4">
          <div>
            <h3 className="text-2xl font-black italic tracking-tighter text-white">Meu Queridômetro</h3>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2">
              Reações que você recebeu hoje
            </p>
          </div>
          
          {/* Badge de Votos mais elegante */}
          <div className="bg-white text-black px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
            {myDailyVotes.length} {myDailyVotes.length === 1 ? 'voto hoje' : 'votos hoje'}
          </div>
        </div>
        
        <div className="relative z-10">
          <ProfileChart votes={myDailyVotes} />
        </div>
      </div>

      {/* --- LISTA DA COMUNIDADE --- */}
      <div className="pt-4">
        <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-6">
          Comunidade ({users.length - 1})
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {users
            .filter(u => u.id !== currentUser.id)
            .map(user => {
              
              const votoDeHoje = votesSent.find(vote => 
                vote.receiverId === user.id && hasVotedToday(vote.createdAt)
              );

              return (
                <div key={user.id} className="bg-zinc-900 border border-zinc-800 rounded-[1.5rem] p-5 flex flex-col gap-5 shadow-lg hover:border-zinc-700 transition-colors">
                  
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
                       <h4 className="text-white font-bold text-lg truncate tracking-tight">{user.name}</h4>
                       <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                         {votoDeHoje ? 'VOTO REGISTRADO' : 'DISPONÍVEL'}
                       </p>
                    </div>

                    <button 
                      onClick={() => router.push(`/profile/${user.id}`)}
                      className="shrink-0 text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-3 py-2 rounded-xl transition-colors uppercase font-bold"
                      title="Ver Dashboard do Dia"
                    >
                      Ver Emojis
                    </button>
                  </div>

                  <div className="bg-black border border-zinc-800 rounded-xl p-3 min-h-[64px] flex items-center justify-center">
                    {votoDeHoje ? (
                      <div className="flex items-center gap-3 bg-zinc-900/80 px-4 py-2.5 rounded-xl border border-zinc-800">
                        <span className="text-2xl drop-shadow-md">{votoDeHoje.emoji}</span>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                          Enviado hoje
                        </span>
                      </div>
                    ) : selectedUser === user.id ? (
                      <div className="flex flex-col w-full gap-4 py-2">
                        <div className="flex flex-wrap justify-center gap-3">
                          {EMOJIS.map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => handleVote(user.id, emoji)}
                              disabled={loading}
                              className="text-2xl hover:scale-125 hover:-translate-y-1 transition-all disabled:opacity-50 drop-shadow-sm"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                        <button 
                          onClick={() => setSelectedUser(null)}
                          className="text-[10px] text-zinc-500 hover:text-zinc-300 font-bold uppercase tracking-wider transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedUser(user.id)}
                        className="w-full h-full text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors py-2"
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