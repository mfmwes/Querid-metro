"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
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
    } else {
      router.push('/auth');
    }
  }, [router]);

  // --- NOVA FUNÇÃO DE UPLOAD DE FOTO ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Verifica se o arquivo não é gigante (limite de 2MB para não pesar o banco)
      if (file.size > 2 * 1024 * 1024) {
        setProfileMessage({ text: 'A imagem deve ter no máximo 2MB.', type: 'error' });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        // Guarda a imagem convertida (Base64) no estado para salvar no banco depois
        setImage(reader.result as string);
        setProfileMessage({ text: '', type: '' }); // Limpa erros antigos
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
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* CABEÇALHO */}
        <div className="flex justify-between items-center mb-8">
            <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
              <span>←</span> Voltar para o Início
            </Link>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-8 md:p-12 rounded-[2rem] shadow-2xl">
          
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-28 h-28 rounded-full bg-zinc-800 border-4 border-zinc-700 flex items-center justify-center mb-4 overflow-hidden shadow-lg">
              {image ? (
                <img src={image} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-black text-zinc-500 uppercase">{name?.substring(0, 2)}</span>
              )}
            </div>
            <h1 className="text-3xl font-black italic text-white tracking-tighter">{name}</h1>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2">{user.email}</p>
          </div>

          {/* --- FORMULÁRIO DE PERFIL (NOME E FOTO) --- */}
          <div className="mb-10">
            <h2 className="text-lg font-black italic text-white mb-2">DADOS DO PERFIL</h2>
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

              {/* BOTÃO DE UPLOAD DE IMAGEM */}
              <div>
                <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest ml-1">Foto de Perfil</label>
                <div className="flex items-center gap-3 mt-1">
                  <label className="cursor-pointer flex-1 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider p-4 rounded-xl transition-all text-center">
                    Escolher Foto
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden" // Esconde o input feio do navegador
                    />
                  </label>
                  
                  {/* Botão de remover foto só aparece se a pessoa já tiver uma */}
                  {image && (
                    <button
                      type="button"
                      onClick={() => setImage('')}
                      className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/30 text-xs font-bold uppercase p-4 rounded-xl transition-all"
                      title="Remover Foto"
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

          {/* --- FORMULÁRIO DE SEGURANÇA (PALAVRA SECRETA) --- */}
          <div className="pt-10 border-t border-zinc-800">
            <h2 className="text-lg font-black italic text-white mb-2">SEGURANÇA</h2>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-6 leading-relaxed">
              Cadastre ou atualize sua palavra secreta para recuperar sua senha caso esqueça.
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

        </div>
      </div>
    </div>
  );
}