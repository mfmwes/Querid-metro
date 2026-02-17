import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { name, email, password, image } = await req.json();
    
    // Hash da senha para segurança
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Se não tiver foto, usa um avatar gerado automaticamente
    const finalImage = image || `https://ui-avatars.com/api/?name=${name}&background=random&color=fff`;

    const user = await prisma.user.create({
      data: { 
        name, 
        email, 
        password: hashedPassword, 
        image: finalImage 
      }
    });

    return NextResponse.json({ id: user.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "E-mail já cadastrado ou erro no servidor." }, { status: 400 });
  }
}