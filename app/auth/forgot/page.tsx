"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [secretWord, setSecretWord] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) return setError('A nova senha deve ter no mínimo 6 dígitos.');
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, secretWord, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert('Senha alterada com sucesso! Você já pode fazer login.');
      router.push('/auth');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] shadow-2xl">
        <h1 className="text-3xl font-black italic tracking-tighter text-white mb-2 text-center">RECUPERAR SENHA</h1>
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest text-center mb-8">
          Use sua palavra secreta para criar uma nova senha
        </p>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs font-bold p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Seu E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white outline-none focus:border-red-500"
            required
          />
          <input
            type="text"
            placeholder="Qual é a sua Palavra Secreta?"
            value={secretWord}
            onChange={(e) => setSecretWord(e.target.value)}
            className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white outline-none focus:border-red-500"
            required
          />
          <input
            type="password"
            placeholder="Digite a Nova Senha (mín. 6 dígitos)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white outline-none focus:border-red-500"
            required
          />
          
          <button type="submit" disabled={loading} className="w-full bg-white text-black font-bold uppercase p-4 rounded-xl hover:bg-zinc-200 mt-4 disabled:opacity-50 transition-all">
            {loading ? 'Salvando...' : 'Redefinir Senha'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <Link href="/auth" className="text-zinc-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
            Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  );
}