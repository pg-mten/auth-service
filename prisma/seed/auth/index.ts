import { PrismaClient } from '@prisma/client';
import { userSeed } from './user.seed';
import { roleSeed } from './role.seed';
import { permissionSeed } from './permission.seed';
import { userPermissionSeed } from './user-permission.seed';
import { articleSeed } from './article.seed';

export async function authSeeder(prisma: PrismaClient) {
  console.log('Scheme Auth Seeder');
  await Promise.all([
    [await roleSeed(prisma), await userSeed(prisma)],
    await permissionSeed(prisma),
  ]);
  Promise.all([userPermissionSeed(prisma), articleSeed(prisma)]);
}
