import { Module } from '@nestjs/common';
import { MerchantDetailService } from './merchant-detail.service';
import { MerchantDetailController } from './merchant-detail.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [MerchantDetailController],
  providers: [MerchantDetailService, PrismaService],
})
export class MerchantDetailModule {}
