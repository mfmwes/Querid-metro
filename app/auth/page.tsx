"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // Importe o cliente que criamos

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Estado separado para o arquivo de imagem
  const [file, setFile] = useState<File | null>(null);
  
  const [form, setForm] = useState({ name: '', email: '', password: '', image: '' });
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = form.image;

      // LÓGICA DE UPLOAD (Só executa se for cadastro e tiver arquivo)
      if (!isLogin && file) {
        // 1. Cria um nome único para o arquivo (evita substituição)
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // 2. Faz o upload para o bucket 'avatars'
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 3. Pega a URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        finalImageUrl = publicUrl;
      }

      // 4. Prossegue com o cadastro/login normal
      const path = isLogin ? '/api/auth/login' : '/api/auth/register';
      
      // Enviamos o formulário com a URL da imagem atualizada
      const bodyData = { ...form, image: finalImageUrl };

      const res = await fetch(path, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData) 
      });
      
      const data = await res.json();

      if (res.ok) {
        if (isLogin) {
          localStorage.setItem('queridometro_user', JSON.stringify(data));
          router.push('/');
        } else {
          alert("Conta criada com sucesso! Faça login.");
          setIsLogin(true);
          setFile(null); // Limpa o arquivo
        }
      } else {
        alert(data.error || "Ocorreu um erro.");
      }

    } catch (error) {
      console.error(error);
      alert("Erro ao fazer upload da imagem ou conectar.");
    } finally {
      setLoading(false);
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
              
              {/* INPUT DE ARQUIVO (UPLOAD) */}
              <div className="bg-black border border-zinc-800 p-2 rounded-2xl">
                <label className="block text-zinc-500 text-xs ml-2 mb-1 uppercase font-bold">Foto de Perfil</label>
                <input 
                  type="file" 
                  accept="image/*"
                  className="w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 cursor-pointer" 
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setFile(e.target.files[0]);
                    }
                  }} 
                />
              </div>
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
          
          <button 
            disabled={loading}
            className="w-full bg-white text-black font-black p-4 rounded-2xl hover:bg-zinc-200 transition-all active:scale-95 uppercase disabled:opacity-50"
          >
            {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
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