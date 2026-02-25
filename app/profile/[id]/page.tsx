"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProfileChart from '@/app/components/ProfileChart';

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>({ totalReceived: 0, totalSent: 0, mood: '😐' });
  const [dailyVotes, setDailyVotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchPublicData = async () => {
      try {
        // Busca os dados e as métricas do usuário específico
        const [userRes, statsRes] = await Promise.all([
          fetch(`/api/user/profile?userId=${userId}`),
          fetch(`/api/user/stats?userId=${userId}`)
        ]);

        if (!userRes.ok) throw new Error("Usuário não encontrado");

        const userData = await userRes.json();
        const statsData = await statsRes.json();

        setUser(userData);
        if (statsData) setStats(statsData);

        // --- FILTRO DO "DASHBOARD DO DIA" (Fuso de Fortaleza) ---
        const formatter = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'America/Fortaleza',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });

        const todayLocal = formatter.format(new Date());

        // Filtra para pegar apenas os votos recebidos HOJE
        const todaysVotes = (userData.votesReceived || []).filter((vote: any) => {
          const voteDateLocal = formatter.format(new Date(vote.createdAt));
          return voteDateLocal === todayLocal;
        });

        setDailyVotes(todaysVotes);

      } catch (error) {
        console.error(error);
        alert("Erro ao carregar perfil.");
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicData();
  }, [userId, router]);

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">Carregando Queridômetro...</div>;
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
              <span>←</span> Voltar para a Comunidade
            </Link>
        </div>

        {/* CARTÃO DE PERFIL */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 relative overflow-hidden backdrop-blur-sm">
           <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

           <div className="w-32 h-32 rounded-full bg-zinc-800 border-4 border-zinc-900 shadow-2xl overflow-hidden shrink-0 flex items-center justify-center">
              {user.image ? (
                <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-black text-zinc-500 uppercase">{user.name?.substring(0, 2)}</span>
              )}
           </div>

           <div className="flex-1 text-center md:text-left space-y-2 w-full">
              <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter text-white">{user.name}</h1>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Dashboard Público</p>
           </div>
        </div>

        {/* GRÁFICO DO DIA */}
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem]">
           <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Queridômetro de Hoje</h3>
                <p className="text-zinc-500 text-xs mt-1">Reações que {user.name} recebeu apenas no dia de hoje.</p>
              </div>
              <div className="bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                {dailyVotes.length} votos hoje
              </div>
           </div>
           
           {/* Repassando apenas os votos de HOJE para o gráfico */}
           <ProfileChart votes={dailyVotes} />
        </div>

      </div>
    </main>
  );
}