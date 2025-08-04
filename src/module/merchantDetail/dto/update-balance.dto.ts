import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateBalanceMerchantDto {
  @ApiProperty()
  @IsString()
  balance: string;
}
