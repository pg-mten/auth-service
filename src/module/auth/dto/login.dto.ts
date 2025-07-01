import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsEmail()
  @ApiProperty({ default: 'zaki@gmail.com' })
  email: string;

  @IsString()
  @ApiProperty({ default: 'zaki' })
  password: string;
}
