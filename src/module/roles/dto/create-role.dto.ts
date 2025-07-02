import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({
    example: 'admin',
    description: 'Nama role yang akan dibuat (misal: admin, editor, viewer)',
  })
  @IsString()
  name: string;
}
