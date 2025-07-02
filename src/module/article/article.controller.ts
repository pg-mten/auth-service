// src/article/article.controller.ts
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { User } from '@prisma/client';
import { PoliciesGuard } from '../casl/policies.guard';
import { CheckPolicies } from '../casl/policy.decorator';
import { AppAbility } from '../casl/casl-ability.factory';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorator/current-user.decorator';

@ApiTags('Articles')
@ApiBearerAuth()
@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can('read', 'Article'))
  @ApiOperation({ summary: 'Get all articles by current user' })
  async findAll(@CurrentUser() user: User) {
    return await this.articleService.findAllByUser(user.id);
  }

  @Post()
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can('create', 'Article'))
  @ApiOperation({ summary: 'Create a new article' })
  async create(@CurrentUser() user: User, @Body() dto: CreateArticleDto) {
    return await this.articleService.create(user.id, dto.name);
  }
}
