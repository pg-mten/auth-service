import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslCacheService } from './casl-cache.service';
import { AppAbility } from './casl-ability.factory';
import { CHECK_POLICIES_KEY } from './policy.decorator';
import { PolicyHandler } from './types/policy-handler.type';
import { IS_PUBLIC_KEY } from '../auth/decorator/public.decorator';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslCache: CaslCacheService,
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
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    const handlers =
      this.reflector.get<PolicyHandler[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) || [];

    if (handlers.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const ability = await this.caslCache.getAbility(user.id);

    return handlers.every((handler) =>
      this.execPolicyHandler(handler, ability),
    );
  }
}
