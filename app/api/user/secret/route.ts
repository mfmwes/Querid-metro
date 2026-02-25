import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PUT(req: Request) {
  try {
    const { userId, secretWord } = await req.json();

    if (!userId || !secretWord || secretWord.length < 3) {
      return NextResponse.json({ error: 'A palavra secreta deve ter pelo menos 3 letras.' }, { status: 400 });
    }

    // Formata (sem espaços e minúscula) e criptografa a nova palavra secreta
    const normalizedSecret = secretWord.trim().toLowerCase();
    const hashedSecret = await bcrypt.hash(normalizedSecret, 10);

    // Salva no banco de dados do usuário específico
    await prisma.user.update({
      where: { id: userId },
      data: { secretWord: hashedSecret },
    });

    return NextResponse.json({ message: 'Palavra secreta atualizada com sucesso!' });
  } catch (error) {
    console.error("Erro ao atualizar palavra secreta:", error);
    return NextResponse.json({ error: 'Erro interno ao salvar palavra secreta.' }, { status: 500 });
  }
}