import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks = {
    database_url: !!process.env.DATABASE_URL,
    anthropic_key: !!process.env.ANTHROPIC_API_KEY,
    postgres_url: !!process.env.POSTGRES_URL,
    postgres_prisma_url: !!process.env.POSTGRES_PRISMA_URL,
    postgres_url_non_pooling: !!process.env.POSTGRES_URL_NON_POOLING,
    database_url_preview: process.env.DATABASE_URL
      ? process.env.DATABASE_URL.replace(/\/\/.*@/, "//***@").substring(0, 50) + "..."
      : "NOT SET",
    anthropic_key_preview: process.env.ANTHROPIC_API_KEY
      ? process.env.ANTHROPIC_API_KEY.substring(0, 10) + "..."
      : "NOT SET",
  };

  // Test database connection
  let dbConnected = false;
  let dbError = "";
  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.$queryRaw`SELECT 1`;
    dbConnected = true;
  } catch (e) {
    dbError = e instanceof Error ? e.message : "Unknown error";
  }

  return NextResponse.json({
    status: dbConnected && checks.anthropic_key ? "ok" : "missing_config",
    checks: {
      ...checks,
      database_connected: dbConnected,
      database_error: dbError || undefined,
    },
  });
}
