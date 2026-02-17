"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// Inicialização do Supabase (para Upload de Fotos)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthPage() {
  const router = useRouter();
  
  // Estados do Formulário
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');

  // Função Principal de Autenticação
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // --- 1. VALIDAÇÕES PRÉVIAS (FRONT-END) ---
      
      // Validação de E-mail (Regex Padrão)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert("Por favor, digite um e-mail válido.");
        setLoading(false);
        return;
      }

      // Validação de Senha
      if (password.length < 6) {
        alert("A senha deve ter no mínimo 6 caracteres.");
        setLoading(false);
        return;
      }

      // Validação de Nome (Apenas no Cadastro)
      if (!isLogin && name.length < 2) {
        alert("O nome precisa ter pelo menos 2 letras.");
        setLoading(false);
        return;
      }

      // --- 2. FLUXO DE CADASTRO (REGISTER) ---
      if (!isLogin) {
        let finalImageUrl = null;

        // Upload da Imagem (Se houver)
        if (file) {
          try {
            // Limpa o nome do arquivo para evitar erros de URL
            const fileExt = file.name.split('.').pop();
            const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '');
            const fileName = `${Date.now()}-${cleanName}.${fileExt}`;

            // Upload para o bucket 'Avatars' (Maiúsculo, conforme seu painel)
            const { error: uploadError } = await supabase.storage
              .from('Avatars') 
              .upload(fileName, file);

            if (uploadError) throw uploadError;

            // Gera a URL Pública
            const { data } = supabase.storage
              .from('Avatars')
              .getPublicUrl(fileName);

            finalImageUrl = data.publicUrl;
            
          } catch (storageError) {
            console.error("Erro no Upload:", storageError);
            alert("Erro ao subir a imagem. Tente uma foto menor ou .jpg");
            setLoading(false);
            return;
          }
        }

        // Chama a API de Criação de Usuário
        const res = await fetch('/api/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name, 
            email, 
            password, 
            image: finalImageUrl 
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Erro ao criar conta.");
        }

        // Sucesso no cadastro: Loga automaticamente
        localStorage.setItem('queridometro_user', JSON.stringify(data));
        router.push('/');
      } 
      
      // --- 3. FLUXO DE LOGIN ---
      else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Credenciais inválidas.");
        }

        // Salva sessão e redireciona
        localStorage.setItem('queridometro_user', JSON.stringify(data));
        router.push('/');
      }

    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Função para pré-visualizar a imagem escolhida
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] shadow-2xl">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black italic tracking-tighter text-white mb-2">
            {isLogin ? 'LOGIN' : 'CADASTRO'}
          </h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
            Queridômetro Online
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          
          {/* Campo de Nome (Só aparece no cadastro) */}
          {!isLogin && (
            <div>
              <input
                type="text"
                placeholder="Seu Nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          )}

          {/* Upload de Foto (Só aparece no cadastro) */}
          {!isLogin && (
            <div className="flex items-center gap-4 bg-black border border-zinc-700 p-2 rounded-xl">
              <label className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase px-3 py-2 rounded-lg transition-colors">
                Escolher Foto
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </label>
              {preview ? (
                <img src={preview} alt="Preview" className="w-8 h-8 rounded-full object-cover border border-zinc-600" />
              ) : (
                <span className="text-zinc-600 text-xs truncate">Nenhuma foto selecionada</span>
              )}
            </div>
          )}

          <div>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Senha (mínimo 6 dígitos)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-bold uppercase text-sm tracking-wider p-4 rounded-xl hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6"
          >
            {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(''); // Limpa erros ao trocar de tela
              setPreview('');
              setFile(null);
            }}
            className="text-zinc-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
          >
            {isLogin ? 'Não tem conta? Crie agora' : 'Já possui conta? Fazer Login'}
          </button>
        </div>

      </div>
    </div>
  );
}