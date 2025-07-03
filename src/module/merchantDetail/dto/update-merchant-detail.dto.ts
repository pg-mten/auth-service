import { PartialType } from '@nestjs/swagger';
import { CreateMerchantDetailDto } from './create-merchant-detail.dto';

export class UpdateMerchantDetailDto extends PartialType(
  CreateMerchantDetailDto,
) {}
