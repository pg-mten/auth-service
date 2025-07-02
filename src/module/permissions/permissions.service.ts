import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreatePermissionDto) {
    return this.prisma.permission.create({ data: dto });
  }

  findAll() {
    return this.prisma.permission.findMany({ include: { role: true } });
  }

  findOne(id: number) {
    return this.prisma.permission.findUnique({ where: { id } });
  }

  update(id: number, dto: UpdatePermissionDto) {
    return this.prisma.permission.update({ where: { id }, data: dto });
  }

  remove(id: number) {
    return this.prisma.permission.delete({ where: { id } });
  }

  async assignToRole(permissionId: number, roleId: number) {
    return this.prisma.permission.update({
      where: { id: permissionId },
      data: { role_id: roleId },
    });
  }

  async unassignFromRole(permissionId: number) {
    return this.prisma.permission.update({
      where: { id: permissionId },
      data: { role_id: null },
    });
  }
  async assignMultiplePermissions(roleId: number, permissionIds: number[]) {
    // Optional: cek apakah role exist
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new Error('Role not found');
    }

    return this.prisma.permission.updateMany({
      where: {
        id: { in: permissionIds },
      },
      data: {
        role_id: roleId,
      },
    });
  }
}
