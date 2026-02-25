"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  // Estados para a Palavra Secreta
  const [secretWord, setSecretWord] = useState('');
  const [secretLoading, setSecretLoading] = useState(false);
  const [secretMessage, setSecretMessage] = useState({ text: '', type: '' }); // type: 'success' ou 'error'

  // Busca o usuário salvo no navegador ao carregar a página
  useEffect(() => {
    const localData = localStorage.getItem('queridometro_user');
    if (localData) {
      setUser(JSON.parse(localData));
    } else {
      // Se não tiver logado, manda pro login
      router.push('/auth');
    }
  }, [router]);

  // Função para salvar a nova Palavra Secreta
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
      setSecretWord(''); // Limpa o campo
    } catch (err: any) {
      setSecretMessage({ text: err.message, type: 'error' });
    } finally {
      setSecretLoading(false);
    }
  };

  // Função de Sair da Conta (Logout)
  const handleLogout = () => {
    localStorage.removeItem('queridometro_user');
    router.push('/auth');
  };

  if (!user) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-bold">Carregando...</div>;

  return (
    <div className="min-h-screen bg-black p-4 flex flex-col items-center">
      
      {/* Botão de Voltar ao Início */}
      <div className="w-full max-w-md flex justify-start mb-6 mt-4">
        <Link href="/" className="text-zinc-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
          ← Voltar para a Home
        </Link>
      </div>

      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] shadow-2xl">
        
        {/* --- INFORMAÇÕES DO USUÁRIO --- */}
        <div className="flex flex-col items-center text-center mb-8">
          {user.image ? (
            <img src={user.image} alt={user.name} className="w-24 h-24 rounded-full object-cover border-4 border-zinc-800 mb-4" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-zinc-800 border-4 border-zinc-700 flex items-center justify-center mb-4 text-3xl font-black text-zinc-600">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-2xl font-black italic text-white">{user.name}</h1>
          <p className="text-zinc-500 text-sm font-bold">{user.email}</p>
        </div>

        {/* --- CAIXA DE SEGURANÇA --- */}
        <div className="mt-8 pt-8 border-t border-zinc-800">
          <h2 className="text-xl font-black italic text-white mb-2">SEGURANÇA</h2>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-6">
            Cadastre uma palavra secreta para recuperar sua senha caso esqueça.
          </p>

          <form onSubmit={handleUpdateSecret} className="space-y-4">
            <input
              type="text"
              placeholder="Digite uma palavra secreta (ex: abacaxi)"
              value={secretWord}
              onChange={(e) => setSecretWord(e.target.value)}
              className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white outline-none focus:border-red-500 transition-colors"
              required
            />
            
            <button
              type="submit"
              disabled={secretLoading}
              className="w-full bg-white text-black font-bold uppercase text-sm tracking-wider p-4 rounded-xl hover:bg-zinc-200 disabled:opacity-50 transition-all"
            >
              {secretLoading ? 'Salvando...' : 'Salvar Palavra Secreta'}
            </button>
            
            {secretMessage.text && (
              <div className={`mt-4 p-3 rounded-xl text-center text-xs font-bold ${secretMessage.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/50' : 'bg-green-500/10 text-green-500 border border-green-500/50'}`}>
                {secretMessage.text}
              </div>
            )}
          </form>
        </div>

        {/* --- BOTÃO DE LOGOUT --- */}
        <div className="mt-8 pt-8 border-t border-zinc-800">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500/10 text-red-500 border border-red-500/50 font-bold uppercase text-xs tracking-wider p-4 rounded-xl hover:bg-red-500 hover:text-white transition-all"
          >
            Sair da Conta
          </button>
        </div>

      </div>
    </div>
  );
}