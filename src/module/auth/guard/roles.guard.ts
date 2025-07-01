import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/shared/constant/auth.constant';
import { ROLES_KEY } from '../decorator/roles.decorator';
import { Request } from 'express';
import { AuthInfoDto } from '../dto/auth.dto';
import { UserService } from 'src/module/user/user.service';

export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;
    const req = context.switchToHttp().getRequest();
    const authInfo: AuthInfoDto = (req as Request).user;
    const user = await this.userService.findOneByAuthInfoThrow(authInfo);

<<<<<<< HEAD
    return requiredRoles.some((role) => user.role.name === role.toString());
=======
    return requiredRoles.some((role) => user.role.name === role);
>>>>>>> 37b995eb6627f9c151a732bc5a7be07760b63761
  }
}
