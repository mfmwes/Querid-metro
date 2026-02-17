import { prisma } from '@/lib/prisma';
import QueridometroClient from './components/QueridometroClient';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      image: true,
    }
  });

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-12">
        <header className="flex justify-between items-center py-4 border-b border-zinc-800">
          <div>
            {/* CORREÇÃO AQUI: Adicionei 'pr-2' (padding-right) para não cortar o itálico */}
            <h1 className="text-3xl font-black italic tracking-tighter bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent pr-2">
              QUERIDÔMETRO
            </h1>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em]">Comunidade Aberta</p>
          </div>
        </header>

        <QueridometroClient users={users} />
      </div>
    </main>
  );
}