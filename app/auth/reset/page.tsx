"use client";
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return alert('A senha deve ter no mínimo 6 caracteres.');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert('Senha alterada com sucesso! Você já pode fazer login.');
      router.push('/auth');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-zinc-500 text-sm font-bold text-center">
        Link inválido ou ausente. Por favor, volte e gere um novo link.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      <input
        type="password"
        placeholder="Digite sua nova senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white outline-none focus:border-red-500 transition-colors"
        required
      />
      <button type="submit" disabled={loading} className="w-full bg-white text-black font-bold uppercase p-4 rounded-xl hover:bg-zinc-200 disabled:opacity-50">
        {loading ? 'Salvando...' : 'Salvar Nova Senha'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] shadow-2xl flex flex-col items-center">
        <h1 className="text-3xl font-black italic tracking-tighter text-white mb-6 text-center">NOVA SENHA</h1>
        
        {/* O Suspense é obrigatório no Next.js ao usar useSearchParams */}
        <Suspense fallback={<div className="text-zinc-500 text-xs">Carregando formulário...</div>}>
          <ResetPasswordForm />
        </Suspense>
        
      </div>
    </div>
  );
}