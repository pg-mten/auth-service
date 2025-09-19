import { PartialType } from '@nestjs/swagger';
import { CreateAgentDto } from './create-agent.dto';

export class UpdateAgentDetailDto extends PartialType(CreateAgentDto) {}
