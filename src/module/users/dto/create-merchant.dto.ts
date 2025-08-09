import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { EmailUnique } from '../validator/email-unique.validator';
import { UsernameUnique } from '../validator/username-unique.validator';

export class CreateMerchantDto {
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
  businessName: string;

  @IsString()
  @ApiProperty()
  npwp: string;

  @IsString()
  @ApiProperty()
  address: string;

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
