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
<<<<<<< HEAD
    role: Role.admin,
=======
    role: Role.ADMIN,
>>>>>>> 37b995eb6627f9c151a732bc5a7be07760b63761
  },
  {
    email: 'rucci@gmail.com',
    password: 'rucci',
    firstName: 'rucci',
    lastName: 'dev',
<<<<<<< HEAD
    role: Role.admin,
=======
    role: Role.ADMIN,
>>>>>>> 37b995eb6627f9c151a732bc5a7be07760b63761
  },
  {
    email: 'winky@gmail.com',
    password: 'winky',
    firstName: 'winky',
    lastName: 'qa',
<<<<<<< HEAD
    role: Role.user,
=======
    role: Role.USER,
>>>>>>> 37b995eb6627f9c151a732bc5a7be07760b63761
  },
  {
    email: 'zaki@gmail.com',
    password: 'zaki',
    firstName: 'zaki',
    lastName: 'ngen',
<<<<<<< HEAD
    role: Role.user,
=======
    role: Role.USER,
>>>>>>> 37b995eb6627f9c151a732bc5a7be07760b63761
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
        isAdmin: userRole === Role.ADMIN,
        passwordHash: await AuthHelper.hashPassword(password),
<<<<<<< HEAD
        roleId:
          roles.find((role) => role.name === userRole.toString())?.id ?? 1,
=======
        roleId: roles.find((role) => role.name === userRole)?.id ?? 1,
>>>>>>> 37b995eb6627f9c151a732bc5a7be07760b63761
      },
    });
    console.log({ userCreated });
  }
}
