import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Retorna sucesso mesmo se não existir por segurança (evita vazamento de contas)
      return NextResponse.json({ message: 'Se o e-mail existir, um link foi gerado.' });
    }

    // Gera um token de 32 caracteres
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // Validade: 1 hora

    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

    // Como você ainda não configurou envio de e-mail, o link vai aparecer no console do VS Code / Vercel
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/auth/reset?token=${resetToken}`;
    
    console.log(`\n======================================================`);
    console.log(`🔑 LINK DE RECUPERAÇÃO PARA: ${email}`);
    console.log(`${resetUrl}`);
    console.log(`======================================================\n`);

    return NextResponse.json({ message: 'Token gerado com sucesso' });
  } catch (error) {
    console.error("Erro no forgot:", error);
    return NextResponse.json({ error: 'Erro interno ao gerar recuperação' }, { status: 500 });
  }
}