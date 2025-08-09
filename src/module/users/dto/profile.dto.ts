import { ApiProperty } from '@nestjs/swagger';
import { ProfileAgentDetailDto } from './profile-agent.dto';
import { ProfileMerchantDetailDto } from './profile-merchant.dto';
import { ProfieAdminDetailDto } from './profile-admin.dto';
import { DtoHelper } from 'src/shared/helper/dto.helper';

export class ProfileDto {
  constructor(data: ProfileDto) {
    DtoHelper.assign(this, data);
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
