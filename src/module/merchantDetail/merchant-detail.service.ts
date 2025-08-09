import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMerchantDetailDto } from './dto/create-merchant-detail.dto';
import { UpdateMerchantDetailDto } from './dto/update-merchant-detail.dto';
import { UpdateBalanceMerchantDto } from './dto/update-balance.dto';

@Injectable()
export class MerchantDetailService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateMerchantDetailDto) {
    return await this.prisma.merchantDetail.create({
      data: {
        ...dto,
        userId: userId,
      },
    });
  }

  async findAll() {
    return await this.prisma.merchantDetail.findMany();
  }

  async findOne(id: number) {
    const detail = await this.prisma.merchantDetail.findUnique({
      where: { id },
    });

    if (!detail) throw new NotFoundException('Merchant detail not found');
    return detail;
  }

  async getByUserId(userId: number) {
    return await this.prisma.merchantDetail.findFirst({
      where: { userId: userId },
    });
  }

  async update(id: number, userId: number, dto: UpdateMerchantDetailDto) {
    await this.findOne(id); // ensure exists
    return this.prisma.merchantDetail.update({
      where: { id },
      data: {
        ...dto,
      },
    });
  }

  async updateBalance(id: number, dto: UpdateBalanceMerchantDto) {
    const { balance } = dto;
    return await this.prisma.merchantDetail.update({
      where: { id },
      data: {
        balance,
      },
    });
  }
}
