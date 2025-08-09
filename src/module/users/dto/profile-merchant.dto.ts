import { ApiProperty } from '@nestjs/swagger';
import Decimal from 'decimal.js';
import { ToDecimalFixed } from 'src/decorator/decimal.decorator';

export class ProfileMerchantDetailDto {
  constructor(data: ProfileMerchantDetailDto) {
    // Object.assign(this, data);
    const allowedKeys = Object.keys(this) as (keyof ProfileMerchantDetailDto)[];
    for (const key of allowedKeys) {
      if (key in data) {
        this[key] = data[key] as any;
      }
    }
  }

  @ApiProperty({ type: String })
  businessName: string;

  @ApiProperty({ type: String })
  npwp: string;

  @ApiProperty({ type: String })
  address: string;

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
