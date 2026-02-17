import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { name, email, password, image } = await req.json();

    // O Prisma exige email e password porque não são opcionais no schema
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password, // Lembre-se de passar a senha (idealmente já hasheada com bcrypt)
        image: image || null,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar usuário. Verifique se enviou nome, email e senha." }, { status: 400 });
  }
}