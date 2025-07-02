import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';

@ApiBearerAuth()
@ApiTags('Permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  create(@Body() dto: CreatePermissionDto) {
    return this.permissionsService.create(dto);
  }

  @Get()
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePermissionDto) {
    return this.permissionsService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(+id);
  }

  @Post(':id/assign-role/:roleId')
  assignToRole(@Param('id') id: string, @Param('roleId') roleId: string) {
    return this.permissionsService.assignToRole(+id, +roleId);
  }

  @Delete(':id/unassign-role')
  unassignFromRole(@Param('id') id: string) {
    return this.permissionsService.unassignFromRole(+id);
  }

  @Post('assign-bulk/:roleId')
  assignMultiplePermissions(
    @Param('roleId') roleId: string,
    @Body() dto: AssignPermissionsDto,
  ) {
    return this.permissionsService.assignMultiplePermissions(
      +roleId,
      dto.permissionIds,
    );
  }
}
