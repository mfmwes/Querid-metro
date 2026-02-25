"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProfileChart from '@/app/components/ProfileChart'; // Importando o seu gráfico!

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  // Controle de Abas (dashboard | edit | security)
  const [activeTab, setActiveTab] = useState('dashboard');

  // Estados dos Votos Históricos (All-Time)
  const [allVotesReceived, setAllVotesReceived] = useState<any[]>([]);
  const [allVotesSent, setAllVotesSent] = useState<any[]>([]);

  // Estados do Perfil (Nome e Foto)
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ text: '', type: '' });

  // Estados da Palavra Secreta
  const [secretWord, setSecretWord] = useState('');
  const [secretLoading, setSecretLoading] = useState(false);
  const [secretMessage, setSecretMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const localData = localStorage.getItem('queridometro_user');
    if (localData) {
      const parsedUser = JSON.parse(localData);
      setUser(parsedUser);
      setName(parsedUser.name || '');
      setImage(parsedUser.image || '');

      // NOVO: Busca o histórico COMPLETO do usuário
      fetch(`/api/user/${parsedUser.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.votesReceived) setAllVotesReceived(data.votesReceived);
          if (data.votesSent) setAllVotesSent(data.votesSent);
        })
        .catch(err => console.error("Erro ao buscar histórico:", err));

    } else {
      router.push('/auth');
    }
  }, [router]);

  // Calcula qual é o emoji mais recebido de todos os tempos
  const getTopEmoji = () => {
    if (allVotesReceived.length === 0) return '😐';
    const counts: Record<string, number> = {};
    allVotesReceived.forEach(v => counts[v.emoji] = (counts[v.emoji] || 0) + 1);
    
    // Ordena do maior para o menor e pega o primeiro
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0][0];
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setProfileMessage({ text: 'A imagem deve ter no máximo 2MB.', type: 'error' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setProfileMessage({ text: '', type: '' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, name, image }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao atualizar perfil.');

      const updatedLocalUser = { ...user, name, image };
      localStorage.setItem('queridometro_user', JSON.stringify(updatedLocalUser));
      setUser(updatedLocalUser);

      setProfileMessage({ text: 'Perfil atualizado com sucesso!', type: 'success' });
    } catch (err: any) {
      setProfileMessage({ text: err.message, type: 'error' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdateSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecretLoading(true);
    setSecretMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/user/secret', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, secretWord }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSecretMessage({ text: 'Palavra secreta cadastrada com sucesso!', type: 'success' });
      setSecretWord('');
    } catch (err: any) {
      setSecretMessage({ text: err.message, type: 'error' });
    } finally {
      setSecretLoading(false);
    }
  };

  if (!user) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">Carregando...</div>;

  return (
    <div className="min-h-screen bg-black p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* CABEÇALHO */}
        <div className="flex justify-between items-center mb-8">
            <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
              <span>←</span> Voltar para o Lobby
            </Link>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 md:p-10 rounded-[2rem] shadow-2xl relative overflow-hidden">
          
          {/* Brilho de Fundo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

          {/* CABEÇALHO DO PERFIL */}
          <div className="flex flex-col md:flex-row items-center gap-6 mb-10 relative z-10">
            <div className="w-28 h-28 shrink-0 rounded-full bg-zinc-800 border-4 border-zinc-700 flex items-center justify-center overflow-hidden shadow-lg">
              {image ? (
                <img src={image} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-black text-zinc-500 uppercase">{name?.substring(0, 2)}</span>
              )}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-black italic text-white tracking-tighter">{name}</h1>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2">{user.email}</p>
            </div>
          </div>

          {/* NAVEGAÇÃO POR ABAS */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-8 border-b border-zinc-800 relative z-10 scrollbar-hide">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === 'dashboard' ? 'bg-white text-black shadow-md' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
            >
              Visão Geral
            </button>
            <button 
              onClick={() => setActiveTab('edit')} 
              className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === 'edit' ? 'bg-white text-black shadow-md' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
            >
              Editar Perfil
            </button>
            <button 
              onClick={() => setActiveTab('security')} 
              className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === 'security' ? 'bg-white text-black shadow-md' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
            >
              Segurança
            </button>
          </div>

          {/* --- ABA 1: VISÃO GERAL (O DASHBOARD HISTÓRICO) --- */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-500 relative z-10">
              
              {/* 3 Cards de Estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-black border border-zinc-800 p-5 rounded-2xl flex flex-col justify-center items-center gap-2">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">O Seu Mood</p>
                  <span className="text-4xl drop-shadow-md">{getTopEmoji()}</span>
                </div>
                
                <div className="bg-black border border-zinc-800 p-5 rounded-2xl flex flex-col justify-center items-center gap-2">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Total Recebido</p>
                  <span className="text-3xl font-black text-white">{allVotesReceived.length}</span>
                </div>

                <div className="bg-black border border-zinc-800 p-5 rounded-2xl flex flex-col justify-center items-center gap-2">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Total Enviado</p>
                  <span className="text-3xl font-black text-white">{allVotesSent.length}</span>
                </div>
              </div>

              {/* Gráfico All-Time */}
              <div className="bg-black border border-zinc-800 p-6 rounded-2xl">
                 <div className="mb-4">
                    <h3 className="text-lg font-bold text-white italic">Histórico Completo</h3>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Todos os votos que você já recebeu desde o início</p>
                 </div>
                 <ProfileChart votes={allVotesReceived} />
              </div>
            </div>
          )}

          {/* --- ABA 2: EDITAR PERFIL --- */}
          {activeTab === 'edit' && (
            <div className="animate-in fade-in duration-500 relative z-10">
              <h2 className="text-lg font-black italic text-white mb-6">DADOS DO PERFIL</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest ml-1">Seu Nome</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white outline-none focus:border-zinc-500 transition-colors mt-1"
                    required
                  />
                </div>

                <div>
                  <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest ml-1">Foto de Perfil</label>
                  <div className="flex items-center gap-3 mt-1">
                    <label className="cursor-pointer flex-1 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider p-4 rounded-xl transition-all text-center">
                      Escolher Foto
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    {image && (
                      <button
                        type="button"
                        onClick={() => setImage('')}
                        className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/30 text-xs font-bold uppercase p-4 rounded-xl transition-all"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="w-full bg-white text-black font-bold uppercase text-xs tracking-wider p-4 rounded-xl hover:bg-zinc-200 disabled:opacity-50 transition-all mt-4"
                >
                  {profileLoading ? 'Salvando...' : 'Atualizar Perfil'}
                </button>
                
                {profileMessage.text && (
                  <div className={`p-3 rounded-xl text-center text-xs font-bold ${profileMessage.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/50' : 'bg-green-500/10 text-green-500 border border-green-500/50'}`}>
                    {profileMessage.text}
                  </div>
                )}
              </form>
            </div>
          )}

          {/* --- ABA 3: SEGURANÇA --- */}
          {activeTab === 'security' && (
            <div className="animate-in fade-in duration-500 relative z-10">
              <h2 className="text-lg font-black italic text-white mb-2">SEGURANÇA</h2>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-6 leading-relaxed">
                Cadastre ou atualize a sua palavra secreta para recuperar a sua senha caso esqueça.
              </p>

              <form onSubmit={handleUpdateSecret} className="space-y-4">
                <input
                  type="text"
                  placeholder="Digite uma palavra secreta (ex: abacaxi)"
                  value={secretWord}
                  onChange={(e) => setSecretWord(e.target.value)}
                  className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white outline-none focus:border-red-500 transition-colors"
                  required
                />
                
                <button
                  type="submit"
                  disabled={secretLoading}
                  className="w-full bg-zinc-800 text-white font-bold uppercase text-xs tracking-wider p-4 rounded-xl hover:bg-zinc-700 disabled:opacity-50 transition-all"
                >
                  {secretLoading ? 'Salvando...' : 'Salvar Palavra Secreta'}
                </button>
                
                {secretMessage.text && (
                  <div className={`p-3 rounded-xl text-center text-xs font-bold ${secretMessage.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/50' : 'bg-green-500/10 text-green-500 border border-green-500/50'}`}>
                    {secretMessage.text}
                  </div>
                )}
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}