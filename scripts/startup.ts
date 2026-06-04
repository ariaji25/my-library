import { execSync, spawn } from "node:child_process";
import { Client } from "pg";
import { createPrismaClient } from "../src/lib/create-prisma";
import { formatSeedResult, seedDatabase } from "../prisma/seed-data";

const MIGRATE_RETRIES = 12;
const MIGRATE_RETRY_MS = 5000;

const DB_READY_TIMEOUT_MS = 90_000;
const DB_READY_INITIAL_DELAY_MS = 2_000;
const DB_READY_MAX_DELAY_MS = 30_000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForDatabase() {
  const deadline = Date.now() + DB_READY_TIMEOUT_MS;
  let delay = DB_READY_INITIAL_DELAY_MS;
  let attempt = 0;

  console.log("[startup] Waiting for Postgres to be ready…");

  while (true) {
    attempt++;
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    try {
      await client.connect();
      await client.query("SELECT 1");
      await client.end();
      console.log(
        `[startup] Postgres is ready (attempt ${attempt})`
      );
      return;
    } catch (err) {
      try {
        await client.end();
      } catch {
        // ignore cleanup errors
      }

      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        throw new Error(
          `[startup] Postgres did not become ready within ${DB_READY_TIMEOUT_MS / 1000}s. ` +
            `Last error: ${err instanceof Error ? err.message : String(err)}`
        );
      }

      const wait = Math.min(delay, remaining);
      console.warn(
        `[startup] Postgres not ready (attempt ${attempt}), retrying in ${wait / 1000}s… ` +
          `(${Math.ceil(remaining / 1000)}s remaining) — ${err instanceof Error ? err.message : String(err)}`
      );
      await sleep(wait);
      // Exponential backoff, capped at DB_READY_MAX_DELAY_MS
      delay = Math.min(delay * 2, DB_READY_MAX_DELAY_MS);
    }
  }
}

async function migrateWithRetry() {
  if (process.env.SKIP_MIGRATE === "true") {
    console.log("[startup] SKIP_MIGRATE=true — skipping migrations");
    return;
  }

  for (let attempt = 1; attempt <= MIGRATE_RETRIES; attempt++) {
    try {
      console.log(`[startup] Running migrations (attempt ${attempt})…`);
      execSync("npx prisma migrate deploy", { stdio: "inherit" });
      return;
    } catch (err) {
      if (attempt === MIGRATE_RETRIES) throw err;
      console.warn(
        `[startup] Migration failed, retrying in ${MIGRATE_RETRY_MS / 1000}s…`,
        err
      );
      await sleep(MIGRATE_RETRY_MS);
    }
  }
}

async function seedInBackground() {
  try {
    const prisma = createPrismaClient();
    try {
      const reset = process.env.SEED_DATABASE === "true";
      const result = await seedDatabase(prisma, { reset });
      console.log(`[startup] ${formatSeedResult(result)}`);
    } finally {
      await prisma.$disconnect();
    }
  } catch (err) {
    console.error("[startup] Seed failed (app keeps running):", err);
  }
}

function startNextServer() {
  const port = process.env.PORT ?? "3000";
  console.log(`[startup] Starting Next.js on 0.0.0.0:${port}…`);

  const next = spawn(
    "npx",
    ["next", "start", "-H", "0.0.0.0", "-p", port],
    {
      stdio: "inherit",
      env: process.env,
    }
  );

  next.on("error", (err) => {
    console.error("[startup] Next.js process error:", err);
    process.exit(1);
  });

  next.on("exit", (code, signal) => {
    if (signal) {
      console.error(`[startup] Next.js killed (${signal})`);
      process.exit(1);
    }
    process.exit(code ?? 0);
  });

  return next;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error(
      "[startup] DATABASE_URL is missing. Link Postgres on Railway: DATABASE_URL=${{Postgres.DATABASE_URL}}"
    );
    process.exit(1);
  }

  await waitForDatabase();
  await migrateWithRetry();
  startNextServer();

  // Seed after HTTP server is up so /api/health responds during healthcheck
  void seedInBackground();
}

main().catch((err) => {
  console.error("[startup] Fatal:", err);
  process.exit(1);
});
