import { OnModuleInit } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { AuditTrailExtension } from './extensions/audit-trail.extension';
import { PrismaClient } from '@prisma/client';

export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(private readonly cls: ClsService) {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    // this.$extends(AuditTrailExtension(this.cls));
    Object.assign(this, this.$extends(AuditTrailExtension(this.cls)));
  }
}
