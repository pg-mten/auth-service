import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMerchantDetailDto } from './dto/create-merchant-detail.dto';
import { UpdateMerchantDetailDto } from './dto/update-merchant-detail.dto';
import { UpdateBalanceMerchantDto } from './dto/update-balance.dto';
import { MerchantDto } from './dto/merchant.dto';
import { DtoHelper } from 'src/shared/helper/dto.helper';
import { MerchantNameDto } from './dto/merchant-names.dto';

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

  async findAllNames() {
    const merchants = await this.prisma.merchantDetail.findMany({
      select: {
        id: true,
        businessName: true,
      },
    });

    return merchants.map((merchant) => {
      return new MerchantNameDto({ ...merchant });
    });
  }

  async findIds(ids: number[]) {
    const merchants = await this.prisma.merchantDetail.findMany({
      where: { id: { in: ids } },
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
    const merchant = await this.prisma.merchantDetail.findUniqueOrThrow({
      where: { id },
      include: { user: true },
    });

    return new MerchantDto({
      ...merchant,
      ...merchant.user,
      merchantId: merchant.id,
      userId: merchant.user.id,
    });
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
