import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../generated/prisma/client";

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

  // Serverless (Vercel): keep pool small to avoid exhausting DB connections
  const pool = new Pool({
    connectionString: url,
    max: process.env.VERCEL ? 1 : 10,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}
