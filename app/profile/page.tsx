"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import ProfileChart from '@/app/components/ProfileChart'; // Importe o novo gráfico

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>({ totalReceived: 0, totalSent: 0, mood: '😐', chartData: [] });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form States
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');

  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('queridometro_user');
    if (!saved) {
      router.push('/auth');
    } else {
      const parsedUser = JSON.parse(saved);
      fetchFullData(parsedUser.id);
    }
  }, [router]);

  const fetchFullData = async (userId: string) => {
    // Busca dados do usuário E as estatísticas em paralelo
    const [userRes, statsRes] = await Promise.all([
      fetch(`/api/user/profile?userId=${userId}`),
      fetch(`/api/user/stats?userId=${userId}`)
    ]);

    const userData = await userRes.json();
    const statsData = await statsRes.json();

    if (userData) {
      setUser(userData);
      setName(userData.name);
      setPreview(userData.image);
    }
    if (statsData) {
      setStats(statsData);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let finalImageUrl = user.image;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true });
        if (error) throw error;
        const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
        finalImageUrl = data.publicUrl;
      }

      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, name, image: finalImageUrl }),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        localStorage.setItem('queridometro_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditing(false);
        setFile(null);
        alert("Perfil atualizado!");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="text-center py-20 text-zinc-500">Carregando Dashboard...</div>;

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* HEADER DE NAVEGAÇÃO */}
        <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
              <span>←</span> Voltar ao Início
            </Link>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-zinc-900 border border-zinc-800 text-xs font-bold uppercase px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Editar Perfil
              </button>
            )}
        </div>

        {/* CARTÃO DE PERFIL (Header do Dashboard) */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 relative overflow-hidden backdrop-blur-sm">
           {/* Background Gradient discreto */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

           <div className="relative group shrink-0">
              <img 
                src={preview || user.image} 
                alt="Profile" 
                className={`w-32 h-32 rounded-full object-cover border-4 border-zinc-900 shadow-2xl ${isEditing ? 'opacity-50' : ''}`}
              />
              {isEditing && (
                <label className="absolute inset-0 flex items-center justify-center cursor-pointer">
                  <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase border border-white/20">Trocar Foto</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setFile(e.target.files[0]);
                      setPreview(URL.createObjectURL(e.target.files[0]));
                    }
                  }}/>
                </label>
              )}
           </div>

           <div className="flex-1 text-center md:text-left space-y-2 w-full">
              {isEditing ? (
                <div className="space-y-4 max-w-md">
                   <input 
                    value={name} onChange={e => setName(e.target.value)}
                    className="w-full bg-black/50 border border-zinc-700 p-3 rounded-xl text-xl font-bold outline-none focus:border-red-500"
                    placeholder="Seu Nome"
                   />
                   <div className="flex gap-2">
                      <button onClick={handleSave} disabled={loading} className="flex-1 bg-white text-black font-bold p-3 rounded-xl hover:bg-zinc-200 text-xs uppercase">{loading ? 'Salvando...' : 'Salvar'}</button>
                      <button onClick={() => {setIsEditing(false); setName(user.name); setPreview(user.image);}} className="flex-1 bg-zinc-800 text-white font-bold p-3 rounded-xl hover:bg-zinc-700 text-xs uppercase">Cancelar</button>
                   </div>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter text-white">{user.name}</h1>
                  <p className="text-zinc-500 text-sm font-medium">{user.email}</p>
                </>
              )}
           </div>
        </div>

        {/* GRID DE KPIs (Métricas) */}
        {!isEditing && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Votos Recebidos */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2rem] relative overflow-hidden group hover:border-zinc-700 transition-all">
               <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
               <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Recebido</p>
               <h3 className="text-4xl font-black text-white">{stats.totalReceived}</h3>
            </div>

            {/* Card 2: Engajamento */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2rem] relative overflow-hidden group hover:border-zinc-700 transition-all">
               <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all"></div>
               <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Votos Enviados</p>
               <h3 className="text-4xl font-black text-white">{stats.totalSent}</h3>
            </div>

            {/* Card 3: Mood Dominante */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2rem] relative overflow-hidden group hover:border-zinc-700 transition-all">
               <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
               <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Seu Mood Principal</p>
               <div className="flex items-center gap-2">
                 <span className="text-4xl" role="img">{stats.mood}</span>
                 <span className="text-xs text-zinc-500 font-bold uppercase bg-zinc-800 px-2 py-1 rounded">Dominante</span>
               </div>
            </div>
          </div>
        )}

        {/* GRÁFICO PRINCIPAL */}
        {!isEditing && (
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem]">
             <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Raio-X de Reações</h3>
                  <p className="text-zinc-500 text-xs mt-1">Todas as reações que você já recebeu.</p>
                </div>
             </div>
             {/* Componente de Gráfico Colorido */}
             <ProfileChart data={stats.chartData} />
          </div>
        )}

      </div>
    </main>
  );
}