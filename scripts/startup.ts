import { execSync, spawn } from "node:child_process";
import { createPrismaClient } from "../src/lib/create-prisma";
import { formatSeedResult, seedDatabase } from "../prisma/seed-data";

const MIGRATE_RETRIES = 12;
const MIGRATE_RETRY_MS = 5000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

  await migrateWithRetry();
  startNextServer();

  // Seed after HTTP server is up so /api/health responds during healthcheck
  void seedInBackground();
}

main().catch((err) => {
  console.error("[startup] Fatal:", err);
  process.exit(1);
});
