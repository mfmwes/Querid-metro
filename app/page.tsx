import { prisma } from '@/lib/prisma';
import QueridometroClient from './components/QueridometroClient'; // Verifique se o caminho da importação está correto para o seu projeto

export default async function HomePage() {
  // Busca os usuários no banco de dados (Server-side)
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      image: true,
    },
    orderBy: {
      name: 'asc' // Ordem alfabética
    }
  });

  return (
    <main className="min-h-screen bg-black p-8">
      {/* CABEÇALHO PADRÃO */}
      <header className="mb-12 border-b border-zinc-800 pb-6 max-w-5xl mx-auto">
        <h1 className="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500">
          QUERIDÔMETRO
        </h1>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">
          Comunidade Aberta
        </p>
      </header>

      {/* AQUI NÓS CHAMAMOS O SEU COMPONENTE CLIENT-SIDE, PASSANDO OS USUÁRIOS */}
      <section className="max-w-5xl mx-auto">
         <QueridometroClient users={users} />
      </section>
    </main>
  );
}