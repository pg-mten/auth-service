import { Module } from '@nestjs/common';
import { AgentDetailService } from './agent-detail.service';
import { AgentDetailController } from './agent-detail.controller';

@Module({
  controllers: [AgentDetailController],
  providers: [AgentDetailService],
  exports: [AgentDetailService],
})
export class AgentDetailModule {}
