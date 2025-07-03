import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateAgentDetailDto {
  @ApiProperty()
  @IsString()
  fullname: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty({ example: 'BCA' })
  @IsString()
  bank_name: string;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  account_number: string;

  @ApiProperty({ example: 'Nama Pemilik Rekening' })
  @IsString()
  account_holder_name: string;
}
