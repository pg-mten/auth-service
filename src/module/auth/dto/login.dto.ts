import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsEmail()
  @ApiProperty({ default: 'le@gmail.com' })
  email: string;

  @IsString()
  @ApiProperty({ default: 'le' })
  password: string;
}
