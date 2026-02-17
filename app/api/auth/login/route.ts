import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const user = await prisma.user.findUnique({ where: { email } });

    if (user && await bcrypt.compare(password, user.password)) {
      // Retorna dados seguros (sem a senha)
      return NextResponse.json({ 
        id: user.id, 
        name: user.name, 
        image: user.image 
      });
    }

    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}