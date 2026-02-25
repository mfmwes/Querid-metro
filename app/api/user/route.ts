import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { name, email, password, image, secretWord } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'E-mail já cadastrado.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Formata a palavra secreta (minúscula e sem espaços) e criptografa
    let hashedSecret = null;
    if (secretWord) {
      const normalizedSecret = secretWord.trim().toLowerCase();
      hashedSecret = await bcrypt.hash(normalizedSecret, 10);
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        image,
        secretWord: hashedSecret,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json({ error: 'Erro interno ao criar conta' }, { status: 500 });
  }
}