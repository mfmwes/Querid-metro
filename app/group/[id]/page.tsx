import { prisma } from '@/lib/prisma';
import QueridometroClient from '../../components/QueridometroClient'; 
import Link from 'next/link';

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const groupId = resolvedParams.id;

  // Busca o grupo e APENAS os usuários que fazem parte dele
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      users: {
        select: { id: true, name: true, image: true },
        orderBy: { name: 'asc' }
      }
    }
  });

  if (!group) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center flex-col gap-4">
        <p className="text-white font-bold">Grupo não encontrado.</p>
        <Link href="/" className="text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">← Voltar ao Lobby</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-5xl mx-auto mb-8">
        <Link href="/" className="text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
          ← Voltar para o Lobby
        </Link>
      </div>

      <header className="mb-10 border-b border-zinc-800 pb-6 max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          {/* A MÁGICA DO pr-2 e pb-1: Dá um fôlego para as letras em itálico não serem cortadas pelo gradiente */}
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500 pr-2 pb-1">
            {group.name}
          </h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2">
            Comunidade Fechada
          </p>
        </div>
        
        {/* Card do Código de Convite */}
        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 px-6 py-3 rounded-2xl text-center shadow-lg">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Código de Convite</p>
          <p className="text-white font-mono font-black tracking-[0.2em] text-xl">{group.inviteCode}</p>
        </div>
      </header>

      <section className="max-w-5xl mx-auto">
         {/* Repassamos os utilizadores desta sala E o groupId para o dashboard saber onde está */}
         <QueridometroClient users={group.users} groupId={groupId} />
      </section>
    </main>
  );
}