import { ApiProperty } from '@nestjs/swagger';
import { AuthInfoDto } from '../../../microservice/auth/dto/auth-info.dto';
import { DtoHelper } from 'src/shared/helper/dto.helper';

export class TokenPayload {
  id: number;

  email: string;

  firstName: string;

  lastName: string;
}

export class AuthDto {
  constructor(data: AuthDto) {
    DtoHelper.assign(this, data);
  }

  @ApiProperty()
  token: string;

  @ApiProperty()
  authInfo: AuthInfoDto;
}
