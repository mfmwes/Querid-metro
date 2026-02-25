import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, secretWord, newPassword } = await req.json();

    if (!email || !secretWord || !newPassword) {
      return NextResponse.json({ error: 'Preencha todos os campos.' }, { status: 400 });
    }

    // 1. Busca o usuário
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'E-mail incorreto ou não encontrado.' }, { status: 400 });
    }

    // 2. VERIFICAÇÃO INTELIGENTE (PALAVRA SECRETA OU CHAVE MESTRA)
    let isSecretValid = false;

    if (user.secretWord) {
      // Cenário A: Usuário novo (tem palavra secreta cadastrada)
      const normalizedSecret = secretWord.trim().toLowerCase();
      isSecretValid = await bcrypt.compare(normalizedSecret, user.secretWord);
    } else {
      // Cenário B: Usuário ANTIGO (não tem palavra secreta) -> Usa a Chave Mestra
      const ADMIN_MASTER_KEY = "admin-senha-123"; 
      
      if (secretWord === ADMIN_MASTER_KEY) {
        isSecretValid = true;
      }
    }

    // Se nenhuma das duas bater, bloqueia
    if (!isSecretValid) {
      return NextResponse.json({ error: 'Palavra secreta incorreta.' }, { status: 400 });
    }

    // 3. Atualiza para a nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: 'Senha alterada com sucesso!' });
  } catch (error) {
    console.error("Erro na recuperação:", error);
    return NextResponse.json({ error: 'Erro interno ao recuperar senha.' }, { status: 500 });
  }
}