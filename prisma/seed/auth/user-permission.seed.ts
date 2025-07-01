import { PrismaClient } from '@prisma/client';
import { Role } from '../../../src/shared/constant/auth.constant';

export async function userPermissionSeed(prisma: PrismaClient) {
  console.log('User Permission Seeder');

  const [users, permissions] = await Promise.all([
    prisma.user.findMany({ include: { role: true } }),
    prisma.permission.findMany(),
  ]);

  for (const user of users) {
    console.log({ user });
    if (user.role.name === Role.admin.toString()) {
      const userPermissionCreated = await prisma.userPermission.create({
        data: { userId: user.id, permissionId: 1 },
      });
      console.log({ userPermissionCreated });
    } else {
      const userPermissionCreated = await prisma.userPermission.createMany({
        data: [
          { userId: user.id, permissionId: 2 },
          { userId: user.id, permissionId: 3 },
          { userId: user.id, permissionId: 4 },
        ],
      });
      console.log({ userPermissionCreated });
    }
  }
}
