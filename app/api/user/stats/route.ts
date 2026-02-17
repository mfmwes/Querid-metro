import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

  // 1. Total de Votos Recebidos (Geral)
  const totalReceived = await prisma.vote.count({
    where: { receiverId: userId }
  });

  // 2. Total de Votos Enviados (Seu Engajamento)
  const totalSent = await prisma.vote.count({
    where: { senderId: userId }
  });

  // 3. Contagem por Emoji (Para o Gráfico e Mood)
  const votesByEmoji = await prisma.vote.groupBy({
    by: ['emoji'],
    where: { receiverId: userId },
    _count: { emoji: true },
    orderBy: { _count: { emoji: 'desc' } }
  });

  // Formata para o gráfico
  const chartData = votesByEmoji.map(v => ({
    emoji: v.emoji,
    count: v._count.emoji
  }));

  // Define o "Mood" (Emoji mais recebido)
  const mood = chartData.length > 0 ? chartData[0].emoji : '😐';

  return NextResponse.json({
    totalReceived,
    totalSent,
    mood,
    chartData
  });
}