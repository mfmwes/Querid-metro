import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 1. AWAIT NO PARAMS: Esta é a nova regra do Next.js 15+ / 16+
    const resolvedParams = await params;
    
    // 2. Agora usamos o resolvedParams.id
    const user = await prisma.user.findUnique({
      where: { id: resolvedParams.id },
      include: {
        votesSent: true,
        votesReceived: true,
      },
    });

    if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Erro na API do usuário:", error);
    return NextResponse.json({ error: 'Erro ao buscar usuário' }, { status: 500 });
  }
}