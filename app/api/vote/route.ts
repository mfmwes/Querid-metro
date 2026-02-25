import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    // 1. Adicionamos o groupId na desestruturação do JSON recebido
    const { senderId, receiverId, emoji, groupId } = await req.json();

    // 2. Validamos se o groupId também foi enviado
    if (!senderId || !receiverId || !emoji || !groupId) {
      return NextResponse.json({ error: 'Dados incompletos (incluindo ID do grupo)' }, { status: 400 });
    }

    // 3. Incluímos o groupId no objeto data do Prisma
    const vote = await prisma.vote.create({
      data: {
        senderId,
        receiverId,
        emoji,
        groupId, // Agora o banco vai saber de qual sala é esse voto
      },
    });

    return NextResponse.json(vote, { status: 201 });
  } catch (error) {
    console.error("Erro ao registrar voto:", error);
    return NextResponse.json({ error: 'Erro interno ao registrar voto' }, { status: 500 });
  }
}