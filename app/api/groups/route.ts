import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// LISTAR os grupos que o utilizador faz parte
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

  try {
    const groups = await prisma.group.findMany({
      where: { users: { some: { id: userId } } },
      include: { 
        _count: { select: { users: true } },
        // A MÁGICA AQUI: Traz os primeiros 5 utilizadores de cada grupo para as miniaturas
        users: {
          take: 5,
          select: { id: true, name: true, image: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(groups);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar grupos' }, { status: 500 });
  }
}

// CRIAR um novo grupo
export async function POST(req: Request) {
  try {
    const { name, userId } = await req.json();
    if (!name || !userId) return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });

    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const group = await prisma.group.create({
      data: {
        name,
        inviteCode,
        users: { connect: { id: userId } }
      }
    });

    return NextResponse.json(group);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar grupo' }, { status: 500 });
  }
}

// ENTRAR num grupo existente com o código
export async function PUT(req: Request) {
  try {
    const { inviteCode, userId } = await req.json();
    if (!inviteCode || !userId) return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });

    const group = await prisma.group.findUnique({ where: { inviteCode } });
    
    if (!group) {
      return NextResponse.json({ error: 'Código inválido ou grupo inexistente.' }, { status: 404 });
    }

    const updatedGroup = await prisma.group.update({
      where: { id: group.id },
      data: { users: { connect: { id: userId } } }
    });

    return NextResponse.json(updatedGroup);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao entrar no grupo' }, { status: 500 });
  }
}