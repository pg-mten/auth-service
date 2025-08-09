import { ApiProperty } from '@nestjs/swagger';
import Decimal from 'decimal.js';
import { ToDecimalFixed } from 'src/decorator/decimal.decorator';
import { DtoHelper } from 'src/shared/helper/dto.helper';

export class ProfileAgentDetailDto {
  constructor(data: ProfileAgentDetailDto) {
    DtoHelper.assign(this, data);
  }

  @ApiProperty({ type: String })
  fullname: string;

  @ApiProperty({ type: String })
  address: string;

  @ApiProperty({ type: String })
  phone: string;

  @ApiProperty({ type: String })
  bankName: string;

  @ApiProperty({ type: String })
  accountNumber: string;

  @ApiProperty({ type: String })
  accountHolderName: string;

  @ToDecimalFixed()
  @ApiProperty({ type: String })
  balance: Decimal;
}
