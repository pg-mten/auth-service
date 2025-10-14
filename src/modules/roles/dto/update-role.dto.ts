import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiPropertyOptional({
    example: 'super_admin',
    description: 'Nama role baru (optional)',
  })
  @IsOptional()
  @IsString()
  name?: string;
}
