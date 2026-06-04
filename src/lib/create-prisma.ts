import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../generated/prisma/client";

/**
 * Prisma client for PostgreSQL (Railway, Docker, or any postgres:// URL).
 */
export function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;

  if (!url?.startsWith("postgres://") && !url?.startsWith("postgresql://")) {
    throw new Error(
      "DATABASE_URL must be a PostgreSQL connection string (postgres:// or postgresql://). " +
        "For local dev: docker compose up -d and copy .env.example. " +
        "On Railway: set DATABASE_URL=${{Postgres.DATABASE_URL}}"
    );
  }

  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}
