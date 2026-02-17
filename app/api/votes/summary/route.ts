import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json([]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const votes = await prisma.vote.groupBy({
    by: ['emoji'],
    where: { 
      receiverId: userId, 
      createdAt: { gte: today } 
    },
    _count: { emoji: true }
  });

  const chartData = votes.map((v) => ({
    emoji: v.emoji,
    count: v._count.emoji
  }));

  return NextResponse.json(chartData);
}