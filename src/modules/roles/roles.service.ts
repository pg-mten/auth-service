import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PRISMA_SERVICE } from '../prisma/prisma.provider';

@Injectable()
export class RolesService {
  constructor(@Inject(PRISMA_SERVICE) private prisma: PrismaClient) {}

  create(dto: CreateRoleDto) {
    return this.prisma.role.create({ data: dto });
  }

  async findAll() {
    const data = await this.prisma.role.findMany({
      include: { Permission: true },
    });
    return data;
  }

  findOne(id: number) {
    return this.prisma.role.findUnique({
      where: { id },
      include: { Permission: true },
    });
  }

  update(id: number, dto: UpdateRoleDto) {
    return this.prisma.role.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: number) {
    return this.prisma.role.delete({ where: { id } });
  }
}
