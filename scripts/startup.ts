import { execSync } from "node:child_process";
import "dotenv/config";
import { createPrismaClient } from "../src/lib/create-prisma";
import { formatSeedResult, seedDatabase } from "../prisma/seed-data";

async function main() {
  console.log("[startup] Running database migrations…");
  execSync("npx prisma migrate deploy", { stdio: "inherit" });

  const prisma = createPrismaClient();

  try {
    const reset = process.env.SEED_DATABASE === "true";
    if (reset) {
      console.log("[startup] SEED_DATABASE=true — reset then seed…");
    } else {
      console.log("[startup] Running idempotent seed…");
    }

    const result = await seedDatabase(prisma, { reset });
    console.log(`[startup] ${formatSeedResult(result)}`);
  } finally {
    await prisma.$disconnect();
  }

  const port = process.env.PORT ?? "3000";
  console.log(`[startup] Starting Next.js on port ${port}…`);
  execSync(`npx next start -H 0.0.0.0 -p ${port}`, { stdio: "inherit" });
}

main().catch((err) => {
  console.error("[startup] Failed:", err);
  process.exit(1);
});
