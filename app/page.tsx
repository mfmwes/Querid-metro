"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LobbyPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [newGroupName, setNewGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('queridometro_user');
    if (userStr) {
      const parsedUser = JSON.parse(userStr);
      setUser(parsedUser);
      fetchGroups(parsedUser.id);
    } else {
      router.push('/auth');
    }
  }, [router]);

  const fetchGroups = async (userId: string) => {
    try {
      const res = await fetch(`/api/groups?userId=${userId}`);
      const data = await res.json();
      setGroups(data);
    } catch (error) {
      console.error("Erro ao buscar grupos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setActionLoading(true);

    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGroupName, userId: user.id }),
      });
      if (res.ok) {
        setNewGroupName('');
        fetchGroups(user.id);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setActionLoading(true);

    try {
      const res = await fetch('/api/groups', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: inviteCode.toUpperCase(), userId: user.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setInviteCode('');
        fetchGroups(user.id);
      } else {
        alert(data.error || 'Erro ao entrar no grupo');
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !user) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">Carregando Lobby...</div>;

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* BARRA DO USUÁRIO */}
        <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-5 w-full md:w-auto">
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border-2 border-zinc-700 shadow-inner shrink-0">
              {user.image ? <img src={user.image} className="w-full h-full object-cover" /> : <span className="text-xl font-black text-zinc-500 uppercase">{user.name?.substring(0, 2)}</span>}
            </div>
            <div>
              <h2 className="text-2xl font-black italic tracking-tighter text-white leading-none">Olá, {user.name}</h2>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1.5">Lobby Principal</p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button onClick={() => router.push('/profile')} className="flex-1 md:flex-none bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md">Perfil</button>
            <button onClick={() => { localStorage.removeItem('queridometro_user'); router.push('/auth'); }} className="flex-1 md:flex-none bg-transparent hover:bg-red-500 text-red-500 hover:text-white border border-red-500/30 text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition-all">Sair</button>
          </div>
        </div>

        {/* CRIAR OU ENTRAR */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form onSubmit={handleCreateGroup} className="bg-zinc-900 border border-zinc-800 rounded-[1.5rem] p-6 flex flex-col gap-4 shadow-lg hover:border-zinc-700 transition-colors">
            <h3 className="text-lg font-black italic text-white">Criar Novo Grupo</h3>
            <input type="text" placeholder="Ex: Turma da Faculdade" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} className="bg-black border border-zinc-800 rounded-xl p-4 text-white outline-none focus:border-zinc-500 transition-colors" required />
            <button type="submit" disabled={actionLoading} className="w-full bg-white text-black font-bold uppercase text-xs tracking-wider p-4 rounded-xl hover:bg-zinc-200 transition-colors">Criar Grupo</button>
          </form>

          <form onSubmit={handleJoinGroup} className="bg-zinc-900 border border-zinc-800 rounded-[1.5rem] p-6 flex flex-col gap-4 shadow-lg hover:border-zinc-700 transition-colors">
            <h3 className="text-lg font-black italic text-white">Entrar com Convite</h3>
            <input type="text" placeholder="Código de 6 letras" value={inviteCode} onChange={e => setInviteCode(e.target.value)} maxLength={6} className="bg-black border border-zinc-800 rounded-xl p-4 text-white outline-none focus:border-zinc-500 transition-colors uppercase text-center tracking-[0.5em] font-mono" required />
            <button type="submit" disabled={actionLoading} className="w-full bg-zinc-800 text-white font-bold uppercase text-xs tracking-wider p-4 rounded-xl hover:bg-zinc-700 transition-colors">Entrar no Grupo</button>
          </form>
        </div>

        {/* SEUS GRUPOS */}
        <div>
          <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-6">Meus Grupos ({groups.length})</h3>
          {groups.length === 0 ? (
            <div className="bg-[#0a0a0a] border border-zinc-800 border-dashed rounded-[2rem] p-10 text-center text-zinc-500 font-bold uppercase tracking-widest text-xs">Você ainda não está em nenhum grupo.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {groups.map(group => (
                <div key={group.id} onClick={() => router.push(`/group/${group.id}`)} className="bg-black border border-zinc-800 hover:border-zinc-600 rounded-[1.5rem] p-6 cursor-pointer transition-all shadow-lg hover:-translate-y-1 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-red-500/10 transition-colors pointer-events-none"></div>
                  <h4 className="text-xl font-black italic text-white mb-6 relative z-10 truncate">{group.name}</h4>
                  <div className="flex justify-between items-center relative z-10">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{group._count?.users || 0} Membros</span>
                    <span className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-400 px-3 py-1.5 rounded-lg font-mono font-bold tracking-widest">CÓD: {group.inviteCode}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}