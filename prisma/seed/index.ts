import { PrismaClient } from '@prisma/client';
import { authSeeder } from './auth';

const prisma = new PrismaClient();

async function main() {
  await authSeeder(prisma);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    // Close Prisma Client at the end
    prisma.$disconnect();
  });
