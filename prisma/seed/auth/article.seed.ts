import { PrismaClient } from '@prisma/client';

export async function articleSeed(prisma: PrismaClient) {
  console.log('Article Seeder');

  const user = await prisma.user.findFirstOrThrow({
    where: { email: 'zaki@gmail.com' },
  });

  for (let i = 1; i <= 5; i++) {
    const articleCreated = await prisma.article.create({
      data: {
        description: user.lastName + '-' + i,
        isPublished: i % 2 === 0 ? true : false,
        authorId: user.id,
      },
    });

    console.log({ articleCreated });
  }
}
