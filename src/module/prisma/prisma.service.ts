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
    this.currentUserId = userId;
  }
  async onModuleInit() {
    this.$use(auditMiddleware(() => this.currentUserId));
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
