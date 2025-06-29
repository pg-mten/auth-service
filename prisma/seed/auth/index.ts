import { PrismaClient } from '@prisma/client';
import { userSeed } from './user.seed';

export async function authSeeder(prisma: PrismaClient) {
  console.log('Scheme Auth Seeder');
  await userSeed(prisma);
}
