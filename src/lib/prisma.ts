import { PrismaClient } from "@prisma/client";

// Resolve DATABASE_URL from Vercel Neon env var candidates at runtime
if (!process.env.DATABASE_URL) {
  const candidates = ["POSTGRES_PRISMA_URL", "POSTGRES_URL_NON_POOLING", "POSTGRES_URL"];
  for (const key of candidates) {
    if (process.env[key]) {
      process.env.DATABASE_URL = process.env[key];
      break;
    }
  }
}

if (!process.env.DIRECT_URL) {
  const directCandidates = ["POSTGRES_URL_NON_POOLING", "POSTGRES_PRISMA_URL", "DATABASE_URL"];
  for (const key of directCandidates) {
    if (process.env[key]) {
      process.env.DIRECT_URL = process.env[key];
      break;
    }
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
