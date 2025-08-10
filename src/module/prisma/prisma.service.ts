import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { auditMiddleware } from './middleware/audit.middleware';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private currentUserId: number | null = null;
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  setUserId(userId: number | null) {
    console.log('PrismaService.setUserId');
    console.log({ userId });
    this.currentUserId = userId;
  }
  async onModuleInit() {
    await this.$connect();
    console.log('PrismaService.OnModuleInit');
    console.log(this.currentUserId);
    this.$use(auditMiddleware(() => this.currentUserId));
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
