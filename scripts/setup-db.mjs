#!/usr/bin/env node

// Maps Vercel/Neon env vars to DATABASE_URL before prisma runs.
// Vercel Neon creates: POSTGRES_URL, POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING
// Prisma schema expects: DATABASE_URL

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
  process.exit(0);
}

process.env.DATABASE_URL = dbUrl;

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
