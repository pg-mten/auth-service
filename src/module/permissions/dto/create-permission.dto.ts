import {
  IsString,
  IsOptional,
  IsBoolean,
  IsJSON,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({
    example: 'read',
    description: 'Action to perform (e.g., read, create)',
  })
  @IsString()
  action: string;

  @ApiProperty({
    example: 'Article',
    description: 'Subject of the permission (e.g., Article)',
  })
  @IsString()
  subject: string;

  @ApiProperty({
    example: 1,
    description: 'Role ID this permission belongs to',
  })
  @IsInt()
  role_id: number;

  @ApiPropertyOptional({
    example: false,
    description: 'Invert the rule (deny instead of allow)',
  })
  @IsOptional()
  @IsBoolean()
  inverted?: boolean;

  @ApiPropertyOptional({
    example: { created_by: '$userId' },
    description: 'Optional conditions in JSON format (used for filtering)',
  })
  @IsOptional()
  @IsJSON()
  conditions?: object;

  @ApiPropertyOptional({
    example: 'Can only read own articles',
    description: 'Reason for this rule',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
