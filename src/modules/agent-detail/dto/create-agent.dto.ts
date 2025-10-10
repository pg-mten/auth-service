import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { EmailUnique } from '../../users/validator/email-unique.validator';

export class CreateAgentDto {
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
