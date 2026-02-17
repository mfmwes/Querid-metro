import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { senderId, receiverId, emoji } = await req.json();

    if (!senderId || !receiverId || !emoji) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    // --- LÓGICA DE FUSO HORÁRIO (BRASIL GMT-3) ---
    const now = new Date();
    
    // 1. Pega a hora atual e subtrai 3 horas para simular o horário do Brasil
    const brazilTime = new Date(now.getTime() - (3 * 60 * 60 * 1000));
    
    // 2. Zera as horas (00:00:00) no "horário do Brasil"
    brazilTime.setUTCHours(0, 0, 0, 0);

    // 3. Adiciona as 3 horas de volta. 
    // Motivo: O banco (Supabase) salva em UTC. 
    // Então, 00:00 no Brasil = 03:00 no banco de dados.
    const startOfDayInUTC = new Date(brazilTime.getTime() + (3 * 60 * 60 * 1000));

    // --- VERIFICAÇÃO DE VOTO DUPLICADO ---
    const existingVote = await prisma.vote.findFirst({
      where: {
        senderId: senderId,
        receiverId: receiverId,
        createdAt: {
          gte: startOfDayInUTC, // Só busca votos criados DEPOIS das 00:00 BRT
        },
      },
    });

    if (existingVote) {
      return NextResponse.json(
        { error: 'Você já votou nesta pessoa hoje! Volte amanhã.' }, 
        { status: 429 } // 429 = Too Many Requests
      );
    }

    // --- CRIA O VOTO SE PASSOU NA VERIFICAÇÃO ---
    const vote = await prisma.vote.create({
      data: {
        senderId,
        receiverId,
        emoji,
      },
    });

    return NextResponse.json(vote);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao processar voto' }, { status: 500 });
  }
}