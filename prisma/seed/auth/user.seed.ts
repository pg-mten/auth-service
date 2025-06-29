import { PrismaClient } from '@prisma/client';
import { AuthHelper } from '../../../src/shared/helper/auth.helper';

const users: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}[] = [
  { email: 'le@gmail.com', password: 'le', firstName: 'le', lastName: 'mail' },
  {
    email: 'rucci@gmail.com',
    password: 'rucci',
    firstName: 'rucci',
    lastName: 'dev',
  },
  {
    email: 'winky@gmail.com',
    password: 'winky',
    firstName: 'winky',
    lastName: 'qa',
  },
  {
    email: 'zaki@gmail.com',
    password: 'zaki',
    firstName: 'zaki',
    lastName: 'ngen',
  },
];

export async function userSeed(prisma: PrismaClient) {
  console.log('User Seeder');

  for (const { email, password, firstName, lastName } of users) {
    const userCreated = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        passwordHash: await AuthHelper.hashPassword(password),
      },
    });
    console.log({ userCreated });
  }
}
