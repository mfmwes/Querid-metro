"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  // Adicionei o campo 'image' ao estado inicial do formulário
  const [form, setForm] = useState({ name: '', email: '', password: '', image: '' });
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const path = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    const res = await fetch(path, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form) 
    });
    
    const data = await res.json();

    if (res.ok) {
      if (isLogin) {
        // Salva os dados completos (agora incluindo a imagem se o login retornar)
        localStorage.setItem('queridometro_user', JSON.stringify(data));
        router.push('/');
      } else {
        alert("Conta criada com sucesso! Agora faça login.");
        setIsLogin(true); // Alterna automaticamente para a tela de login
      }
    } else {
      alert(data.error || "Ocorreu um erro.");
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl">
        <h1 className="text-4xl font-black italic mb-2 text-center bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
          {isLogin ? 'LOGIN' : 'CADASTRO'}
        </h1>
        <p className="text-zinc-500 text-center mb-8 text-sm uppercase tracking-widest">Queridômetro Online</p>
        
        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <>
              <input 
                type="text" 
                placeholder="Seu Nome" 
                required 
                className="w-full bg-black border border-zinc-800 p-4 rounded-2xl outline-none focus:border-red-500 transition-all" 
                onChange={e => setForm({...form, name: e.target.value})} 
              />
              {/* NOVO CAMPO: Só aparece no cadastro */}
              <input 
                type="url" 
                placeholder="URL da Foto (Instagram/LinkedIn)" 
                className="w-full bg-black border border-zinc-800 p-4 rounded-2xl outline-none focus:border-red-500 transition-all" 
                onChange={e => setForm({...form, image: e.target.value})} 
              />
            </>
          )}
          
          <input 
            type="email" 
            placeholder="E-mail" 
            required 
            className="w-full bg-black border border-zinc-800 p-4 rounded-2xl outline-none focus:border-red-500 transition-all" 
            onChange={e => setForm({...form, email: e.target.value})} 
          />
          <input 
            type="password" 
            placeholder="Senha" 
            required 
            className="w-full bg-black border border-zinc-800 p-4 rounded-2xl outline-none focus:border-red-500 transition-all" 
            onChange={e => setForm({...form, password: e.target.value})} 
          />
          
          <button className="w-full bg-white text-black font-black p-4 rounded-2xl hover:bg-zinc-200 transition-all active:scale-95 uppercase">
            {isLogin ? 'Entrar' : 'Criar Conta'}
          </button>
        </form>

        <button 
          onClick={() => setIsLogin(!isLogin)} 
          className="w-full mt-6 text-zinc-500 text-xs hover:text-white uppercase tracking-tighter transition-colors"
        >
          {isLogin ? 'Ainda não tem conta? Clique aqui' : 'Já possui conta? Voltar ao login'}
        </button>
      </div>
    </main>
  );
}