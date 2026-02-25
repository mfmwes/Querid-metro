import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'], // Opcional: ajuda a ver os logs no terminal
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;