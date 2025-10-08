import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { EmailUnique } from '../../users/validator/email-unique.validator';

export class CreateMerchantDto {
  @EmailUnique()
  @IsString()
  @ApiProperty()
  email: string;

  @IsString()
  @ApiProperty()
  password: string;

  @IsString()
  @ApiProperty()
  ownerName: string;

  @IsString()
  @ApiProperty()
  businessName: string;

  @IsString()
  @ApiProperty()
  brandName: string;

  @IsString()
  @ApiProperty()
  phoneNumber: string;

  @IsString()
  @ApiProperty()
  nik: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: String, required: false })
  ktpImage: string | null;

  @IsString()
  @ApiProperty()
  npwp: string;

  @IsString()
  @ApiProperty()
  address: string;

  @IsString()
  @ApiProperty()
  province: string;

  @IsString()
  @ApiProperty()
  regency: string;

  @IsString()
  @ApiProperty()
  district: string;

  @IsString()
  @ApiProperty()
  village: string;

  @IsString()
  @ApiProperty()
  postalCode: string;

  @IsString()
  @ApiProperty()
  bankName: string;

  @IsString()
  @ApiProperty()
  accountNumber: string;

  @IsString()
  @ApiProperty()
  accountHolderName: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: String, required: false })
  siupFile: string | null;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ type: Number, required: false })
  settlementInterval: number | null;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: String, required: false })
  coordinate: string | null;
}
