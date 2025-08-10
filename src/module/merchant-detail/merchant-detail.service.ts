import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMerchantDetailDto } from './dto/create-merchant-detail.dto';
import { UpdateMerchantDetailDto } from './dto/update-merchant-detail.dto';
import { UpdateBalanceMerchantDto } from './dto/update-balance.dto';
import { MerchantDto } from './dto/merchant.dto';
import { DtoHelper } from 'src/shared/helper/dto.helper';

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
    const merchants = await this.prisma.merchantDetail.findMany({
      include: { user: true },
    });

    return merchants.map((merchant) => {
      return new MerchantDto({
        ...merchant,
        ...merchant.user,
        merchantId: merchant.id,
        userId: merchant.user.id,
      });
    });
  }

  async findOneThrow(id: number) {
    const detail = await this.prisma.merchantDetail.findUniqueOrThrow({
      where: { id },
    });

    if (!detail) throw new NotFoundException('Merchant detail not found');
    return detail;
  }

  async update(id: number, userId: number, dto: UpdateMerchantDetailDto) {
    await this.findOneThrow(id); // ensure exists
    const filterDto = DtoHelper.filter(dto);
    return this.prisma.merchantDetail.update({
      where: { id },
      data: {
        ...filterDto,
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
