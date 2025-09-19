import { PartialType } from '@nestjs/swagger';
import { CreateMerchantDto } from './create-merchant.dto';

export class UpdateMerchantDetailDto extends PartialType(CreateMerchantDto) {}
