import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateRoleDto) {
    return this.prisma.role.create({ data: dto });
  }

  findAll() {
    return this.prisma.role.findMany({ include: { Permission: true } });
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
