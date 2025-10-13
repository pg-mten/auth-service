import { Module } from '@nestjs/common';
import { MerchantDetailService } from './merchant-detail.service';
import { MerchantDetailController } from './merchant-detail.controller';
import { MerchantSignatureService } from './merchant-signature.service';

@Module({
  controllers: [MerchantDetailController],
  providers: [MerchantDetailService, MerchantSignatureService],
  exports: [MerchantDetailService, MerchantSignatureService],
})
export class MerchantDetailModule {}
