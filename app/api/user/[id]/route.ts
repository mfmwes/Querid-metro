import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get('groupId');
  const userId = params.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        // Filtramos os votos recebidos pelo grupo (se enviado)
        votesReceived: {
          where: groupId ? { groupId: groupId } : {},
          orderBy: { createdAt: 'desc' },
        },
        // Filtramos os votos enviados pelo grupo (se enviado)
        votesSent: {
          where: groupId ? { groupId: groupId } : {},
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar dados do usuário' }, { status: 500 });
  }
}