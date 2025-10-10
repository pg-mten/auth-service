import { Inject, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { DateHelper } from 'src/shared/helper/date.helper';
import { PRISMA_SERVICE } from '../prisma/prisma.provider';

@Injectable()
export class PermissionsService {
  constructor(@Inject(PRISMA_SERVICE) private prisma: PrismaClient) {}

  create(data: CreatePermissionDto) {
    return this.prisma.permission.create({ data });
  }

  findAll() {
    return this.prisma.permission.findMany({
      where: { deletedAt: null },
    });
  }

  findOne(id: number) {
    return this.prisma.permission.findUnique({ where: { id } });
  }

  update(id: number, data: UpdatePermissionDto) {
    return this.prisma.permission.update({ where: { id }, data });
  }

  softDelete(id: number) {
    return this.prisma.permission.update({
      where: { id },
      data: {
        deletedAt: DateHelper.now().toJSDate(),
      },
    });
  }

  async assignToRole(permissionId: number, roleId: number) {
    return this.prisma.permission.update({
      where: { id: permissionId },
      data: { roleId: roleId },
    });
  }

  async unassignFromRole(permissionId: number) {
    return this.prisma.permission.update({
      where: { id: permissionId },
      data: { roleId: null },
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
        roleId: roleId,
      },
    });
  }
}