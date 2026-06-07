import { PrismaPg } from "@prisma/adapter-pg";
import { Pool, type PoolConfig } from "pg";
import { PrismaClient } from "../generated/prisma/client";

function isPooledDatabaseUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    lower.includes("pooler.supabase.com") ||
    lower.includes("pgbouncer=true") ||
    lower.includes(":6543/")
  );
}

function poolMaxForUrl(url: string): number {
  const override = process.env.PG_POOL_MAX?.trim();
  if (override) {
    const n = Number.parseInt(override, 10);
    if (Number.isFinite(n) && n >= 1) return n;
  }

  // Serverless and Supabase/PgBouncer: one connection per Node process
  if (process.env.VERCEL || isPooledDatabaseUrl(url)) {
    return 1;
  }

  return 5;
}

/**
 * Prisma client for PostgreSQL (Vercel, Railway, Docker, or any postgres:// URL).
 */
export function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;

  if (!url?.startsWith("postgres://") && !url?.startsWith("postgresql://")) {
    throw new Error(
      "DATABASE_URL must be a PostgreSQL connection string (postgres:// or postgresql://). " +
        "On Vercel: add Postgres storage and set DATABASE_URL on the project."
    );
  }

  const poolConfig: PoolConfig = {
    connectionString: url,
    max: poolMaxForUrl(url),
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
    allowExitOnIdle: true,
  };

  const pool = new Pool(poolConfig);
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}
