import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgentDetailDto } from './dto/create-agent-detail.dto';
import { UpdateAgentDetailDto } from './dto/update-agent-detail.dto';
import { UpdateBalanceAgentDto } from './dto/update-balance.dto';

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
    return await this.prisma.agentDetail.findMany();
  }
  async findOne(id: number) {
    const detail = await this.prisma.agentDetail.findUnique({
      where: { id },
    });

    if (!detail) throw new NotFoundException('Agent detail not found');
    return detail;
  }

  async update(id: number, userId: number, dto: UpdateAgentDetailDto) {
    await this.findOne(id); // validate exists
    return this.prisma.agentDetail.update({
      where: { id },
      data: {
        ...dto,
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
