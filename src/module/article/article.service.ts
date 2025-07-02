// src/article/article.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ArticleService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUser(userId: number) {
    return await this.prisma.article.findMany({
      where: {
        created_by: userId,
      },
    });
  }

  async create(userId: number, name: string) {
    return await this.prisma.article.create({
      data: {
        name,
        created_by: userId,
      },
    });
  }
}
