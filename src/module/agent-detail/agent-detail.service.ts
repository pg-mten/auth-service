import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgentDetailDto } from './dto/create-agent-detail.dto';
import { UpdateAgentDetailDto } from './dto/update-agent-detail.dto';
import { UpdateBalanceAgentDto } from './dto/update-balance.dto';
import { AgentDto } from './dto/agent.dto';
import { DtoHelper } from 'src/shared/helper/dto.helper';

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
  async findOneThrow(id: number) {
    const detail = await this.prisma.agentDetail.findUniqueOrThrow({
      where: { id },
    });

    if (!detail) throw new NotFoundException('Agent detail not found');
    return detail;
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

  async updateBalance(id: number, userId: number, dto: UpdateBalanceAgentDto) {
    const { balance } = dto;
    return await this.prisma.agentDetail.update({
      where: { id },
      data: { balance },
    });
  }
}
