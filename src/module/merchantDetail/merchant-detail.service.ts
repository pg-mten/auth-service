import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMerchantDetailDto } from './dto/create-merchant-detail.dto';
import { UpdateMerchantDetailDto } from './dto/update-merchant-detail.dto';

@Injectable()
export class MerchantDetailService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateMerchantDetailDto) {
    return await this.prisma.merchantDetail.create({
      data: {
        ...dto,
        user_id: userId,
        created_by: userId,
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
      where: { user_id: userId },
    });
  }

  async update(id: number, userId: number, dto: UpdateMerchantDetailDto) {
    await this.findOne(id); // ensure exists
    return this.prisma.merchantDetail.update({
      where: { id },
      data: {
        ...dto,
        updated_by: userId,
      },
    });
  }

  async updateBalance(id: number, userId: number, balance: number) {
    await this.prisma.merchantDetail.update({
      where: { id },
      data: {
        balance,
      },
    });
  }
}
