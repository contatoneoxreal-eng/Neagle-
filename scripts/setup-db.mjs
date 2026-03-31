#!/usr/bin/env node

// This script maps Vercel/Neon env vars to DATABASE_URL before prisma runs.
// Vercel Neon integration creates: POSTGRES_URL, POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING
// Our Prisma schema expects: DATABASE_URL

const candidates = [
  "DATABASE_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL_NON_POOLING",
  "POSTGRES_URL",
];

let dbUrl = "";
for (const key of candidates) {
  if (process.env[key]) {
    dbUrl = process.env[key];
    console.log(`[setup-db] Using ${key} as DATABASE_URL`);
    break;
  }
}

if (!dbUrl) {
  console.warn("[setup-db] WARNING: No database URL found. Skipping database setup.");
  console.warn("[setup-db] Set DATABASE_URL or connect Neon Postgres in Vercel Storage.");
  process.exit(0);
}

// Export for child processes
process.env.DATABASE_URL = dbUrl;

// Also set DIRECT_URL for Prisma directUrl
if (!process.env.DIRECT_URL) {
  const directCandidates = ["POSTGRES_URL_NON_POOLING", "POSTGRES_PRISMA_URL", "DATABASE_URL"];
  for (const key of directCandidates) {
    if (process.env[key]) {
      process.env.DIRECT_URL = process.env[key];
      break;
    }
  }
}

// Run prisma db push
import { execSync } from "child_process";
try {
  execSync("npx prisma db push --skip-generate --accept-data-loss", {
    stdio: "inherit",
    env: process.env,
  });
  console.log("[setup-db] Database schema synced successfully.");
} catch (e) {
  console.warn("[setup-db] WARNING: prisma db push failed. Tables might already exist.");
}
