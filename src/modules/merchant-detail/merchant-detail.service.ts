import { Inject, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UpdateMerchantDetailDto } from './dto/update-merchant-detail.dto';
import { MerchantDto } from './dto/merchant.dto';
import { DtoHelper } from 'src/shared/helper/dto.helper';
import { MerchantNameDto } from './dto/merchant-names.dto';
import { PRISMA_SERVICE } from '../prisma/prisma.provider';

@Injectable()
export class MerchantDetailService {
  constructor(@Inject(PRISMA_SERVICE) private readonly prisma: PrismaClient) {}

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

  async update(id: number, dto: UpdateMerchantDetailDto) {
    await this.findOneThrow(id); // ensure exists
    const filterDto = DtoHelper.filter(dto);
    return this.prisma.merchantDetail.update({
      where: { id },
      data: {
        ...filterDto,
      },
    });
  }
}
