import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AgentDetailService } from './agent-detail.service';
import { CreateAgentDetailDto } from './dto/create-agent-detail.dto';
import { UpdateAgentDetailDto } from './dto/update-agent-detail.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { CheckPolicies } from '../casl/policy.decorator';
import { AppAbility } from '../casl/casl-ability.factory';
import { PoliciesGuard } from '../casl/policies.guard';
import { UpdateBalanceAgentDto } from './dto/update-balance.dto';

@ApiTags('Agent Detail')
@ApiBearerAuth()
@Controller('agent-detail')
export class AgentDetailController {
  constructor(private readonly service: AgentDetailService) {}

  @Post()
  @CheckPolicies((ability: AppAbility) => ability.can('create', 'AgentDetail'))
  create(@Body() dto: CreateAgentDetailDto, @CurrentUser('id') userId: number) {
    return this.service.create(userId, dto);
  }

  @Get()
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can('read', 'AgentDetail'))
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @CheckPolicies((ability: AppAbility) => ability.can('read', 'AgentDetail'))
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch('update/:id')
  @CheckPolicies((ability: AppAbility) => ability.can('update', 'AgentDetail'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAgentDetailDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.service.update(+id, userId, dto);
  }

  @Patch('update-balance/:id')
    updateBalance(
      @Param('id') id: string,
      @Body() dto: UpdateBalanceAgentDto,
      @CurrentUser('id') userId: number,
    ) {
      return this.service.updateBalance(+id, userId, dto);
    }
}
