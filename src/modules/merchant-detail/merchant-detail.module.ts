import { Module } from '@nestjs/common';
import { MerchantDetailService } from './merchant-detail.service';
import { MerchantDetailController } from './merchant-detail.controller';

@Module({
  controllers: [MerchantDetailController],
  providers: [MerchantDetailService],
  exports: [MerchantDetailService],
})
export class MerchantDetailModule {}
