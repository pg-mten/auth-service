import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslCacheService } from './casl-cache.service';
import { AppAbility } from './casl-ability.factory';
import { CHECK_POLICIES_KEY } from './policy.decorator';
import { PolicyHandler } from './types/policy-handler.type';
import { PUBLIC_API_KEY } from '../../microservice/auth/decorator/public.decorator';
import { Request } from 'express';
import { ClsService } from 'nestjs-cls';
import { SYSTEM_API_KEY } from 'src/microservice/auth/decorator/system.decorator';
import { MERCHANT_API_KEY } from 'src/microservice/auth/decorator/merchant.decorator';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslCache: CaslCacheService,
    private cls: ClsService,
  ) {}

  private execPolicyHandler(
    handler: PolicyHandler,
    ability: AppAbility,
  ): boolean {
    if (typeof handler === 'function') {
      return handler(ability);
    }
    return handler.handle(ability);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublicApi = this.reflector.getAllAndOverride<boolean>(
      PUBLIC_API_KEY,
      [context.getHandler(), context.getClass()],
    );
    const isSystemApi = this.reflector.getAllAndOverride<boolean>(
      SYSTEM_API_KEY,
      [context.getHandler(), context.getClass()],
    );
    const isMerchantApi = this.reflector.getAllAndOverride<boolean>(
      MERCHANT_API_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isPublicApi || isSystemApi || isMerchantApi) return true;

    const req = context.switchToHttp().getRequest();
    const authInfo = (req as Request).user;

    if (!authInfo) return false;

    if (authInfo.role === 'ADMIN_SUPER') return true;
    const handlers =
      this.reflector.get<PolicyHandler[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) || [];

    if (handlers.length === 0) return true;

    console.log({ authInfo });
    console.log(this.cls.get('authInfo'));
    const ability = await this.caslCache.getAbility(authInfo.userId);

    return handlers.every((handler) =>
      this.execPolicyHandler(handler, ability),
    );
  }
}
