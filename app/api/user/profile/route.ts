import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Busca dados atuais do usuário
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, image: true }
  });

  return NextResponse.json(user);
}

// PUT: Atualiza nome e foto
export async function PUT(req: Request) {
  try {
    const { userId, name, image } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, image }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar perfil" }, { status: 500 });
  }
}