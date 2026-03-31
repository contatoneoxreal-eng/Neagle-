/** @type {import('next').NextConfig} */

// Map Vercel Neon Postgres env vars to what Prisma expects
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
  const candidates = ["POSTGRES_URL_NON_POOLING", "POSTGRES_URL", "DATABASE_URL"];
  for (const key of candidates) {
    if (process.env[key]) {
      process.env.DIRECT_URL = process.env[key];
      break;
    }
  }
}

const nextConfig = {};

export default nextConfig;
