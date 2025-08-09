import { ApiProperty } from '@nestjs/swagger';
import { ProfileAgentDetailDto } from './profile-agent.dto';
import { ProfileMerchantDetailDto } from './profile-merchant.dto';
import { ProfieAdminDetailDto } from './profile-admin.dto';

export class ProfileDto {
  constructor(data: ProfileDto) {
    // Object.assign(this, data);
    const allowedKeys = Object.keys(this) as (keyof ProfileDto)[];
    for (const key of allowedKeys) {
      if (key in data) {
        this[key] = data[key] as any;
      }
    }
  }

  @ApiProperty({ type: String })
  username: string;

  @ApiProperty({ type: String })
  email: string;

  @ApiProperty({ type: ProfileAgentDetailDto, required: false })
  agent?: ProfileAgentDetailDto | null;

  @ApiProperty({ type: ProfileMerchantDetailDto, required: false })
  merchant?: ProfileMerchantDetailDto | null;

  @ApiProperty({ type: ProfieAdminDetailDto, required: false })
  admin?: ProfieAdminDetailDto | null;
}
