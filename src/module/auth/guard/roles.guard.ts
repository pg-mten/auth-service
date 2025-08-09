import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/shared/constant/auth.constant';
import { ROLES_KEY } from '../decorator/roles.decorator';
import { Request } from 'express';
import { AuthInfoDto } from '../dto/auth.dto';
import { IS_PUBLIC_KEY } from '../decorator/public.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;
    const req = context.switchToHttp().getRequest();
    const authInfo: AuthInfoDto = (req as Request).user;
    // const user = await this.userService.findOneByAuthInfoThrow(authInfo);
    // return requiredRoles.some((role) => user.role.name === role.toString());
    // return Object.values(Role).some()
    return requiredRoles.includes(authInfo.role as Role);
  }
}
