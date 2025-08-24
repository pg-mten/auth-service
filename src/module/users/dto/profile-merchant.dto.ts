import { ApiProperty } from '@nestjs/swagger';
import { DtoHelper } from 'src/shared/helper/dto.helper';

export class ProfileMerchantDetailDto {
  constructor(data: ProfileMerchantDetailDto) {
    DtoHelper.assign(this, data);
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
}
