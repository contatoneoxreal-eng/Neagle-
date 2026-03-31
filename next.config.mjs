/** @type {import('next').NextConfig} */

// Map Vercel Neon Postgres env vars to what Prisma expects
// Vercel Neon creates: POSTGRES_URL, POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING
// Prisma schema expects: DATABASE_URL
const dbCandidates = ["POSTGRES_PRISMA_URL", "POSTGRES_URL_NON_POOLING", "POSTGRES_URL"];
if (!process.env.DATABASE_URL) {
  for (const key of dbCandidates) {
    if (process.env[key]) {
      process.env.DATABASE_URL = process.env[key];
      console.log(`[next.config] Mapped ${key} → DATABASE_URL`);
      break;
    }
  }
}

const nextConfig = {};

export default nextConfig;
