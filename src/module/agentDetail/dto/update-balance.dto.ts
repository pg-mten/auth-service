import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateBalanceAgentDto {
  @ApiProperty()
  @IsString()
  balance: string;
}
