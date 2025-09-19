import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AuthInfoDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty()
  firstName: string;

  @Expose()
  @ApiProperty()
  lastName: string;

  @Expose()
  @ApiProperty()
  role: string;
}
