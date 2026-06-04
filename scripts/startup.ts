import { execSync, spawn } from "node:child_process";
import { Client } from "pg";
import { createPrismaClient } from "../src/lib/create-prisma";
import { formatSeedResult, seedDatabase } from "../prisma/seed-data";

const MIGRATE_RETRIES = 12;
const MIGRATE_RETRY_MS = 5000;

const DB_READY_TIMEOUT_MS = 120_000;
const DB_READY_INITIAL_DELAY_MS = 2_000;
const DB_READY_MAX_DELAY_MS = 15_000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForDatabase() {
  const url = process.env.DATABASE_URL;
  if (!url) return;

  const deadline = Date.now() + DB_READY_TIMEOUT_MS;
  let delay = DB_READY_INITIAL_DELAY_MS;
  let attempt = 0;

  console.log("[startup] Waiting for Postgres to be ready…");

  while (true) {
    attempt++;
    const client = new Client({ connectionString: url });
    try {
      await client.connect();
      await client.query("SELECT 1");
      await client.end();
      console.log(`[startup] Postgres is ready (attempt ${attempt})`);
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
          `Postgres not ready within ${DB_READY_TIMEOUT_MS / 1000}s: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }

      const wait = Math.min(delay, remaining);
      console.warn(
        `[startup] Postgres not ready (attempt ${attempt}), retry in ${wait / 1000}s…`
      );
      await sleep(wait);
      delay = Math.min(delay * 2, DB_READY_MAX_DELAY_MS);
    }
  }
}

function migrationDatabaseUrl(): string {
  const direct = process.env.DIRECT_DATABASE_URL?.trim();
  const pooled = process.env.DATABASE_URL?.trim();
  const url = direct || pooled;
  if (!url) throw new Error("DATABASE_URL is not set");
  if (!direct && pooled?.includes(":6543")) {
    throw new Error(
      "Set DIRECT_DATABASE_URL (Supabase direct port 5432) for migrations — transaction pooler :6543 is not supported"
    );
  }
  return url;
}

async function migrateWithRetry() {
  if (process.env.SKIP_MIGRATE === "true") {
    console.log("[startup] SKIP_MIGRATE=true — skipping migrations");
    return;
  }

  const databaseUrl = migrationDatabaseUrl();

  for (let attempt = 1; attempt <= MIGRATE_RETRIES; attempt++) {
    try {
      console.log(`[startup] Running migrations (attempt ${attempt})…`);
      execSync("npx prisma migrate deploy", {
        stdio: "inherit",
        env: { ...process.env, DATABASE_URL: databaseUrl },
      });
      return;
    } catch (err) {
      if (attempt === MIGRATE_RETRIES) throw err;
      console.warn(
        `[startup] Migration failed, retry in ${MIGRATE_RETRY_MS / 1000}s…`,
        err
      );
      await sleep(MIGRATE_RETRY_MS);
    }
  }
}

async function seedDatabaseSafe() {
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
    console.error("[startup] Seed failed:", err);
  }
}

const GRACEFUL_SIGNALS: NodeJS.Signals[] = ["SIGTERM", "SIGINT"];
let shuttingDown = false;

function startNextServer() {
  const port = process.env.PORT ?? "3000";
  console.log(`[startup] Starting Next.js on 0.0.0.0:${port}…`);

  const next = spawn("npx", ["next", "start", "-H", "0.0.0.0", "-p", port], {
    stdio: "inherit",
    env: process.env,
  });

  const forwardSignal = (name: NodeJS.Signals) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`[startup] Received ${name}, shutting down…`);
    if (!next.killed) next.kill(name);
  };

  for (const signal of GRACEFUL_SIGNALS) {
    process.on(signal, () => forwardSignal(signal));
  }

  next.on("error", (err) => {
    console.error("[startup] Next.js process error:", err);
    process.exit(1);
  });

  next.on("exit", (code, signal) => {
    if (shuttingDown && signal && GRACEFUL_SIGNALS.includes(signal)) {
      process.exit(0);
      return;
    }
    if (signal) {
      console.error(`[startup] Next.js exited unexpectedly (${signal})`);
      process.exit(1);
    }
    process.exit(code ?? 0);
  });

  return next;
}

/** DB setup runs after HTTP is listening so Railway /api/health succeeds quickly. */
async function setupDatabaseInBackground() {
  if (!process.env.DATABASE_URL) {
    console.error(
      "[startup] DATABASE_URL is missing — set DATABASE_URL=${{Postgres.DATABASE_URL}} on this service"
    );
    return;
  }

  try {
    await waitForDatabase();
    await migrateWithRetry();
    await seedDatabaseSafe();
    console.log("[startup] Database setup complete");
  } catch (err) {
    console.error("[startup] Database setup failed:", err);
  }
}

function main() {
  // Start HTTP first — healthcheck hits /api/health without waiting for Postgres
  startNextServer();
  void setupDatabaseInBackground();
}

main();
