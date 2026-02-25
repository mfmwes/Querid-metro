import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 });
    }

    // Busca usuário pelo token e verifica se não está expirado
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }, // Verifica se a data de expiração é maior que agora
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Token inválido ou expirado. Gere um novo link.' }, { status: 400 });
    }

    // Encripta a nova senha e limpa o token do banco
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({ message: 'Senha atualizada com sucesso' });
  } catch (error) {
    console.error("Erro no reset:", error);
    return NextResponse.json({ error: 'Erro interno ao redefinir senha' }, { status: 500 });
  }
}