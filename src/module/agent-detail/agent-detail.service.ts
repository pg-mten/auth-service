import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgentDetailDto } from './dto/create-agent-detail.dto';
import { UpdateAgentDetailDto } from './dto/update-agent-detail.dto';
import { AgentDto } from './dto/agent.dto';
import { DtoHelper } from 'src/shared/helper/dto.helper';
import { AgentNameDto } from './dto/agent-name.dto';

@Injectable()
export class AgentDetailService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateAgentDetailDto) {
    return await this.prisma.agentDetail.create({
      data: {
        ...dto,
        userId: userId,
      },
    });
  }

  async findAll() {
    const agents = await this.prisma.agentDetail.findMany({
      include: { user: true },
    });

    return agents.map((agent) => {
      return new AgentDto({
        ...agent,
        ...agent.user,
        agentId: agent.id,
        userId: agent.user.id,
      });
    });
  }

  async findAllNames() {
    const agents = await this.prisma.agentDetail.findMany({
      select: {
        id: true,
        fullname: true,
      },
    });

    return agents.map((agent) => {
      return new AgentNameDto({ ...agent });
    });
  }

  async findIds(ids: number[]) {
    const agents = await this.prisma.agentDetail.findMany({
      where: { id: { in: ids } },
      include: { user: true },
    });

    return agents.map((agent) => {
      return new AgentDto({
        ...agent,
        ...agent.user,
        agentId: agent.id,
        userId: agent.user.id,
      });
    });
  }

  async findOneThrow(id: number) {
    const agent = await this.prisma.agentDetail.findUniqueOrThrow({
      where: { id },
      include: { user: true },
    });

    return new AgentDto({
      ...agent,
      ...agent.user,
      agentId: agent.id,
      userId: agent.user.id,
    });
  }

  async update(id: number, userId: number, dto: UpdateAgentDetailDto) {
    await this.findOneThrow(id);
    const filterDto = DtoHelper.filter(dto);
    return this.prisma.agentDetail.update({
      where: { id },
      data: {
        ...filterDto,
      },
    });
  }
}
