import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { senderId, receiverId, emoji } = body;

    // --- 1. VALIDAÇÃO BÁSICA ---
    if (!senderId || !receiverId || !emoji) {
      return NextResponse.json(
        { error: 'Dados incompletos. senderId, receiverId e emoji são obrigatórios.' }, 
        { status: 400 }
      );
    }

    // --- 2. LÓGICA DE FUSO HORÁRIO (AMERICA/FORTALEZA) ---
    const now = new Date();
    
    // Formata a data atual para o fuso horário local no padrão YYYY-MM-DD
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Fortaleza',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    
    const localDateString = formatter.format(now);

    // Crava o horário para 00:00:00 no fuso de -03:00 
    const startOfDayLocal = new Date(`${localDateString}T00:00:00-03:00`);

    // --- 3. VERIFICAÇÃO DE VOTO DUPLICADO ---
    const existingVote = await prisma.vote.findFirst({
      where: {
        senderId: senderId,
        receiverId: receiverId,
        createdAt: {
          gte: startOfDayLocal, // Compara com as 00:00 de hoje
        },
      },
    });

    if (existingVote) {
      return NextResponse.json(
        { error: 'Você já votou nesta pessoa hoje! Volte amanhã após a meia-noite.' }, 
        { status: 429 }
      );
    }

    // --- 4. REGISTRA O VOTO ---
    const vote = await prisma.vote.create({
      data: {
        senderId,
        receiverId,
        emoji,
      },
    });

    return NextResponse.json(vote, { status: 201 });

  } catch (error) {
    console.error("Erro ao processar voto:", error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao processar o voto.' }, 
      { status: 500 }
    );
  }
}