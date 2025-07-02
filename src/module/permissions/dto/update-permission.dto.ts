import {
  IsString,
  IsOptional,
  IsBoolean,
  IsJSON,
  IsInt,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePermissionDto {
  @ApiPropertyOptional({ example: 'create' })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({ example: 'Article' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  role_id?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  inverted?: boolean;

  @ApiPropertyOptional({ example: { created_by: '$userId' } })
  @IsOptional()
  @IsJSON()
  conditions?: object;

  @ApiPropertyOptional({ example: 'Allows editing only own content' })
  @IsOptional()
  @IsString()
  reason?: string;
}
