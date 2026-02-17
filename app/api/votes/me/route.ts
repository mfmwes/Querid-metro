import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const senderId = searchParams.get('senderId');

  if (!senderId) return NextResponse.json({});

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const votes = await prisma.vote.findMany({
    where: { 
      senderId: senderId,
      createdAt: { gte: today }
    },
    select: { receiverId: true, emoji: true }
  });

  // Transforma em objeto: { "ID_DO_COLEGA": "EMOJI_ESCOLHIDO" }
  const votesMap = votes.reduce((acc: any, vote) => {
    acc[vote.receiverId] = vote.emoji;
    return acc;
  }, {});

  return NextResponse.json(votesMap);
}