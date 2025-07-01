import { PrismaClient } from '@prisma/client';
import { AuthHelper } from '../../../src/shared/helper/auth.helper';
import { Role } from '../../../src/shared/constant/auth.constant';

const users: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
}[] = [
  {
    email: 'le@gmail.com',
    password: 'le',
    firstName: 'le',
    lastName: 'mail',
    role: Role.admin,
  },
  {
    email: 'rucci@gmail.com',
    password: 'rucci',
    firstName: 'rucci',
    lastName: 'dev',
    role: Role.admin,
  },
  {
    email: 'winky@gmail.com',
    password: 'winky',
    firstName: 'winky',
    lastName: 'qa',
    role: Role.user,
  },
  {
    email: 'zaki@gmail.com',
    password: 'zaki',
    firstName: 'zaki',
    lastName: 'ngen',
    role: Role.user,
  },
];

export async function userSeed(prisma: PrismaClient) {
  console.log('User Seeder');

  const roles = await prisma.role.findMany();

  for (const {
    email,
    password,
    firstName,
    lastName,
    role: userRole,
  } of users) {
    const userCreated = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        passwordHash: await AuthHelper.hashPassword(password),
        roleId:
          roles.find((role) => role.name === userRole.toString())?.id ?? 1,
      },
    });
    console.log({ userCreated });
  }
}
