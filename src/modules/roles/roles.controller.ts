import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Headers,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CheckPolicies } from '../casl/policy.decorator';
import { AppAbility } from '../casl/casl-ability.factory';
import { CurrentAuthInfo } from 'src/microservice/auth/decorator/current-auth-info.decorator';
import { AuthInfoDto } from 'src/microservice/auth/dto/auth-info.dto';

@ApiBearerAuth()
@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  // @CheckPolicies((ability: AppAbility) => ability.can('create', 'Role'))
  async create(
    @Body() body: CreateRoleDto,
    @CurrentAuthInfo() authInfo: AuthInfoDto,
  ) {
    console.log({ body, authInfo });
    return this.rolesService.create(body);
  }

  @Get()
  @CheckPolicies((ability: AppAbility) => ability.can('read', 'Role'))
  findAll() {
    console.log('controller');
    return this.rolesService.findAll();
  }

  @Get('/:id')
  @CheckPolicies((ability: AppAbility) => ability.can('read', 'Role'))
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(+id);
  }

  @Put(':id')
  @CheckPolicies((ability: AppAbility) => ability.can('update', 'Role'))
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(+id, dto);
  }

  @Delete(':id')
  @CheckPolicies((ability: AppAbility) => ability.can('delete', 'Role'))
  remove(@Param('id') id: string) {
    return this.rolesService.remove(+id);
  }
}
