import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { EmailUnique } from '../../users/validator/email-unique.validator';
import { UsernameUnique } from '../../users/validator/username-unique.validator';

export class CreateAgentDto {
  @UsernameUnique()
  @IsString()
  @ApiProperty()
  username: string;

  @EmailUnique()
  @IsString()
  @ApiProperty()
  email: string;

  @IsString()
  @ApiProperty()
  password: string;

  @IsString()
  @ApiProperty()
  fullname: string;

  @IsString()
  @ApiProperty()
  address: string;

  @IsString()
  @ApiProperty()
  phone: string;

  @IsString()
  @ApiProperty()
  bankName: string;

  @IsString()
  @ApiProperty()
  accountNumber: string;

  @IsString()
  @ApiProperty()
  accountHolderName: string;
}
