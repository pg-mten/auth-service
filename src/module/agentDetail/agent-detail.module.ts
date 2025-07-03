import { Module } from '@nestjs/common';
import { AgentDetailService } from './agent-detail.service';
import { AgentDetailController } from './agent-detail.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CaslModule } from '../casl/casl.module';
import { PoliciesGuard } from '../casl/policies.guard';

@Module({
  controllers: [AgentDetailController],
  providers: [AgentDetailService, PrismaService, PoliciesGuard],
  imports: [CaslModule],
})
export class AgentDetailModule {}
