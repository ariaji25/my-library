import { spawnSync } from "node:child_process";
import "dotenv/config";

const direct = process.env.DIRECT_DATABASE_URL?.trim();
const pooled = process.env.DATABASE_URL?.trim();
const databaseUrl = direct || pooled;

if (!databaseUrl) {
  console.error(
    "Missing DATABASE_URL. Copy .env.example to .env and set a Postgres URL."
  );
  process.exit(1);
}

if (!direct && pooled?.includes(":6543")) {
  console.error(`
Cannot run migrations through Supabase transaction pooler (port 6543).
Migrations hang or fail because the pooler does not support DDL reliably.

Fix — pick one:
  1. Local Docker:  docker compose up -d postgres
     DATABASE_URL="postgresql://mylibrary:mylibrary@localhost:5433/mylibrary"

  2. Supabase: add DIRECT_DATABASE_URL in .env (Database → Connect → Direct connection, port 5432)
     DIRECT_DATABASE_URL="postgresql://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres"

Then run: npm run db:migrate
`);
  process.exit(1);
}

const result = spawnSync("npx", ["prisma", "migrate", "dev"], {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: databaseUrl },
});

process.exit(result.status ?? 1);
