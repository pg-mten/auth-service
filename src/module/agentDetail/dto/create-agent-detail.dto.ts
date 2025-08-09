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
  bankName: string;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  accountNumber: string;

  @ApiProperty({ example: 'Nama Pemilik Rekening' })
  @IsString()
  accountHolderName: string;
}
