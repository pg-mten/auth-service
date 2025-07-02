import { Module } from '@nestjs/common';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { PrismaService } from '../prisma/prisma.service';
import { CaslModule } from '../casl/casl.module';
import { PoliciesGuard } from '../casl/policies.guard';

@Module({
  controllers: [ArticleController],
  providers: [ArticleService, PrismaService, PoliciesGuard],
  imports: [CaslModule],
  exports: [ArticleService],
})
export class ArticleModule {}
