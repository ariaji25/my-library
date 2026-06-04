import "dotenv/config";
import { createPrismaClient } from "../src/lib/create-prisma";
import { formatSeedResult, seedDatabase } from "./seed-data";

const prisma = createPrismaClient();

async function main() {
  const reset = process.argv.includes("--reset");
  const result = await seedDatabase(prisma, { reset });
  console.log(reset ? "[seed] Reset + idempotent seed:" : "[seed] Idempotent seed:");
  console.log(formatSeedResult(result));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
