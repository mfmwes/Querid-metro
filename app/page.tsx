import { prisma } from '@/lib/prisma';
import QueridometroClient from './components/QueridometroClient';

export default async function Page() {
  // Busca todos os usuários cadastrados para a lista de votação
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      image: true,
    }
  });

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-12">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              QUERIDÔMETRO
            </h1>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em]">Comunidade Aberta</p>
          </div>
        </header>

        {/* O Client Component resolve quem está logado via localStorage */}
        <QueridometroClient users={users} />
      </div>
    </main>
  );
}