import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { senderId, receiverId, emoji } = await req.json();

    if (!senderId || !receiverId || !emoji) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    // Cria o voto no banco conectando quem enviou, quem recebeu e qual foi o emoji
    const vote = await prisma.vote.create({
      data: {
        senderId,
        receiverId,
        emoji,
      },
    });

    return NextResponse.json(vote, { status: 201 });
  } catch (error) {
    console.error("Erro ao registrar voto:", error);
    return NextResponse.json({ error: 'Erro interno ao registrar voto' }, { status: 500 });
  }
}