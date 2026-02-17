import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { name, email, password, image } = await req.json();

    // --- 1. VALIDAÇÃO DE CAMPOS OBRIGATÓRIOS ---
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nome, email e senha são obrigatórios." }, { status: 400 });
    }

    // --- 2. VALIDAÇÃO DE FORMATO DE EMAIL ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "O formato do e-mail é inválido." }, { status: 400 });
    }

    // --- 3. VALIDAÇÃO DE SENHA (Mínimo 6 caracteres) ---
    if (password.length < 6) {
      return NextResponse.json({ error: "A senha deve ter pelo menos 6 caracteres." }, { status: 400 });
    }

    // --- 4. VERIFICA SE O EMAIL JÁ EXISTE ---
    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      return NextResponse.json({ error: "Este e-mail já está cadastrado." }, { status: 409 });
    }

    // --- CRIAÇÃO DO USUÁRIO ---
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        image: image || null,
      },
    });

    return NextResponse.json(user);

  } catch (error) {
    console.error("Erro no registro:", error);
    return NextResponse.json({ error: "Erro interno ao criar usuário." }, { status: 500 });
  }
}