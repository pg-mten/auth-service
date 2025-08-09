import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsEmail()
  @ApiProperty({ default: 'superadmin@example.com' })
  email: string;

  @IsString()
  @ApiProperty({ default: 'password123' })
  password: string;
}
