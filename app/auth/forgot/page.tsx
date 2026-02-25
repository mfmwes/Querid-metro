"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage('Se o e-mail existir no nosso sistema, o link de recuperação foi gerado! Verifique o console do servidor.');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] shadow-2xl">
        <h1 className="text-3xl font-black italic tracking-tighter text-white mb-2 text-center">RECUPERAR SENHA</h1>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest text-center mb-8">Digite seu e-mail cadastrado</p>
        
        {message ? (
          <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-4 rounded-xl text-center text-sm font-bold">
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white outline-none focus:border-red-500 transition-colors"
              required
            />
            <button type="submit" disabled={loading} className="w-full bg-white text-black font-bold uppercase p-4 rounded-xl hover:bg-zinc-200 disabled:opacity-50">
              {loading ? 'Processando...' : 'Gerar Link'}
            </button>
          </form>
        )}
        
        <div className="mt-6 text-center">
          <Link href="/auth" className="text-zinc-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
            Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  );
}