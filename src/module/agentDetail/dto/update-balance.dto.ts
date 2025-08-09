import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateIf } from 'class-validator';
import Decimal from 'decimal.js';

export class UpdateBalanceAgentDto {
  @ApiProperty({ type: String })
  @Type(() => Decimal)
  @ValidateIf((o) => o.balance !== undefined)
  balance: Decimal;
}
