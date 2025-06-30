import { PrismaClient } from '@prisma/client';
import { userSeed } from './user.seed';
import { roleSeed } from './role.seed';

export async function authSeeder(prisma: PrismaClient) {
  console.log('Scheme Auth Seeder');

  await roleSeed(prisma);
  await userSeed(prisma);
}
