import { PrismaClient } from '@prisma/client';
import { Role } from '../../../src/shared/constant/auth.constant';

export async function roleSeed(prisma: PrismaClient) {
  console.log('Role Seeeder');

  for (const role in Role) {
    const roleCreated = await prisma.role.create({
      data: {
        name: role,
      },
    });
    console.log({ roleCreated });
  }
}
