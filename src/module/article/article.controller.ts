import { Controller, Get, Post } from '@nestjs/common';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { AuthInfoDto } from '../auth/dto/auth.dto';
import { ArticleService } from './article.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('/article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @ApiBearerAuth()
  @Get('')
  findMany(@CurrentUser() authInfo: AuthInfoDto) {
    // return authInfo;
    return this.articleService.findManyThrow(authInfo);
  }

  @ApiBearerAuth()
  @Post('')
  update(@CurrentUser() authInfo: AuthInfoDto) {
    return this.articleService.update(authInfo);
  }

  @ApiBearerAuth()
  @Get('ss')
  findOne(@CurrentUser() authInfo: AuthInfoDto) {
    return this.articleService.findOne(authInfo);
  }
}
