"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthPage() {
  const router = useRouter();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); 
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretWord, setSecretWord] = useState(''); // NOVO ESTADO
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("Por favor, digite um e-mail válido.");
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError("A senha deve ter no mínimo 6 caracteres.");
        setLoading(false);
        return;
      }

      if (!isLogin && name.length < 2) {
        setError("O nome precisa ter pelo menos 2 letras.");
        setLoading(false);
        return;
      }

      // VALIDAÇÃO DA PALAVRA SECRETA
      if (!isLogin && secretWord.length < 3) {
        setError("Crie uma palavra secreta com pelo menos 3 letras.");
        setLoading(false);
        return;
      }

      if (!isLogin) {
        let finalImageUrl = null;

        if (file) {
          try {
            const fileExt = file.name.split('.').pop();
            const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '');
            const fileName = `${Date.now()}-${cleanName}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
              .from('Avatars') 
              .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
              .from('Avatars')
              .getPublicUrl(fileName);

            finalImageUrl = data.publicUrl;
            
          } catch (storageError) {
            console.error("Erro no Upload:", storageError);
            setError("Erro ao subir a imagem. Tente uma foto menor ou .jpg");
            setLoading(false);
            return;
          }
        }

        const res = await fetch('/api/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // ENVIANDO A PALAVRA SECRETA AQUI:
          body: JSON.stringify({ name, email, password, image: finalImageUrl, secretWord }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Erro ao criar conta.");

        localStorage.setItem('queridometro_user', JSON.stringify(data));
        router.push('/');
      } 
      else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Credenciais inválidas.");

        localStorage.setItem('queridometro_user', JSON.stringify(data));
        router.push('/');
      }

    } catch (error: any) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

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

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs font-bold p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          
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

          {!isLogin && (
            <div className="flex items-center gap-4 bg-black border border-zinc-700 p-2 rounded-xl">
              <label className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase px-3 py-2 rounded-lg transition-colors">
                Escolher Foto
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
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

          <div className="space-y-2">
            <input
              type="password"
              placeholder="Senha (mínimo 6 dígitos)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
            />
            
            {isLogin && (
              <div className="flex justify-end">
                <Link 
                  href="/auth/forgot" 
                  className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors underline decoration-zinc-700 underline-offset-4"
                >
                  Esqueceu a senha?
                </Link>
              </div>
            )}
          </div>

          {/* NOVO CAMPO DA PALAVRA SECRETA SÓ NO CADASTRO */}
          {!isLogin && (
            <div>
              <input
                type="text"
                placeholder="Palavra Secreta (Para recuperar senha)"
                value={secretWord}
                onChange={(e) => setSecretWord(e.target.value)}
                className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
              />
              <p className="text-[10px] text-zinc-500 mt-1 ml-1">
                Guarde bem. Se você esquecer a senha, só ela poderá recuperá-la.
              </p>
            </div>
          )}

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
              setError('');
              setPreview('');
              setFile(null);
              setSecretWord('');
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