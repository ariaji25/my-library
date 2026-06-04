import { spawnSync } from "node:child_process";
import "dotenv/config";

const direct = process.env.DIRECT_DATABASE_URL?.trim();
const pooled = process.env.DATABASE_URL?.trim();
const databaseUrl = direct || pooled;

if (!databaseUrl) {
  console.error("Missing DATABASE_URL.");
  process.exit(1);
}

if (!direct && pooled?.includes(":6543")) {
  console.error(
    "Set DIRECT_DATABASE_URL (Supabase direct port 5432) before migrate deploy."
  );
  process.exit(1);
}

const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: databaseUrl },
});

process.exit(result.status ?? 1);
