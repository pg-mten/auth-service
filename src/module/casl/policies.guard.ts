// src/casl/policies.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory } from './casl-ability.factory';
import { PrismaService } from '../prisma/prisma.service';
import { CHECK_POLICIES_KEY, PolicyHandler } from './policy.decorator';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslFactory: CaslAbilityFactory,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handlers =
      this.reflector.get<PolicyHandler[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) || [];

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const userWithRole = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        role: {
          include: { Permission: true },
        },
      },
    });

    const ability = this.caslFactory.createForPermissions(
      userWithRole?.role?.Permission || [],
      userWithRole?.id,
    );

    for (const handler of handlers) {
      if (!handler(ability)) {
        throw new ForbiddenException(
          'You are not allowed to perform this action',
        );
      }
    }

    return true;
  }
}
