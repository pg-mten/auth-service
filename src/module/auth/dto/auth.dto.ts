import { ApiProperty } from '@nestjs/swagger';
import { AuthInfoDto } from './auth-info.dto';

export class TokenPayload {
  id: number;

  email: string;

  firstName: string;

  lastName: string;
}

export class AuthDto {
  constructor() {}
  @ApiProperty()
  token: string;

  @ApiProperty()
  authInfo: AuthInfoDto;
}
