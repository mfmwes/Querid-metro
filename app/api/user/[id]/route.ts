import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// No Next.js 15, o segundo argumento (context) tem params como uma Promise
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // 1. Aguardar a resolução dos params
  const { id: userId } = await context.params;
  
  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get('groupId');

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        votesReceived: {
          where: groupId ? { groupId: groupId } : {},
          orderBy: { createdAt: 'desc' },
        },
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
    console.error("Erro na API de usuário:", error);
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
  }
}