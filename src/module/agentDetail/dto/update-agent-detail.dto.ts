import { PartialType } from '@nestjs/swagger';
import { CreateAgentDetailDto } from './create-agent-detail.dto';

export class UpdateAgentDetailDto extends PartialType(CreateAgentDetailDto) {}
