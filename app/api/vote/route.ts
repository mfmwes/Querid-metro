import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { receiverId, emoji, senderId } = await req.json();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Verifica se já votou nessa pessoa hoje
    const existingVote = await prisma.vote.findFirst({
      where: {
        senderId,
        receiverId,
        createdAt: { gte: today }
      }
    });

    if (existingVote) {
      return NextResponse.json({ error: "Você já votou nesta pessoa hoje!" }, { status: 400 });
    }

    await prisma.vote.create({
      data: { senderId, receiverId, emoji }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao computar voto" }, { status: 500 });
  }
}