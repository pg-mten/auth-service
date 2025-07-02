// src/article/dto/create-article.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleDto {
  @ApiProperty({ example: 'How to use CASL with NestJS' })
  @IsNotEmpty()
  @IsString()
  name: string;
}
