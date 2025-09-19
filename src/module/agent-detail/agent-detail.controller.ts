import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { AgentDetailService } from './agent-detail.service';
import { UpdateAgentDetailDto } from './dto/update-agent-detail.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AgentDto } from './dto/agent.dto';
import { ResponseDto, ResponseStatus } from 'src/shared/response.dto';
import { Public } from '../../microservice/auth/decorator/public.decorator';
import { AgentNameDto } from './dto/agent-name.dto';

@ApiTags('Agent Detail')
@ApiBearerAuth()
@Controller('agent-detail')
export class AgentDetailController {
  constructor(private readonly service: AgentDetailService) {}

  // TODO Pagination
  @Get()
  // @CheckPolicies((ability: AppAbility) => ability.can('read', 'AgentDetail'))
  @ApiOperation({ summary: 'List of Agents' })
  @ApiOkResponse({ type: AgentDto, isArray: true })
  findAll() {
    return this.service.findAll();
  }

  @Public()
  @Get('dropdown')
  @ApiOperation({ summary: 'List of Agent Id and Name for dropdown' })
  @ApiOkResponse({ type: AgentNameDto, isArray: true })
  findAllNames() {
    return this.service.findAllNames();
  }

  @Get(':id')
  // @CheckPolicies((ability: AppAbility) => ability.can('read', 'AgentDetail'))
  @ApiOperation({ summary: 'Agent by id' })
  @ApiOkResponse({ type: AgentDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneThrow(id);
  }

  @Patch('update/:id')
  // @CheckPolicies((ability: AppAbility) => ability.can('update', 'AgentDetail'))
  @ApiOperation({ summary: 'Update Agent by id' })
  @ApiBody({ type: UpdateAgentDetailDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAgentDetailDto,
  ) {
    await this.service.update(id, dto);
    return new ResponseDto({ status: ResponseStatus.UPDATED });
  }
}
