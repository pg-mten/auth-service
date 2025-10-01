import { Inject, Injectable } from '@nestjs/common';
import { CaslAbilityFactory } from './casl-ability.factory';
import { PrismaClient } from '@prisma/client';
import { AppAbility } from './casl-ability.factory';
import { Permission } from '@prisma/client';
import { PRISMA_SERVICE } from '../prisma/prisma.provider';

const abilityCache = new Map<number, AppAbility>();

@Injectable()
export class CaslCacheService {
  constructor(
    @Inject(PRISMA_SERVICE) private readonly prisma: PrismaClient,
    private readonly abilityFactory: CaslAbilityFactory,
  ) {}

  async getAbility(userId: number): Promise<AppAbility> {
    const cached = abilityCache.get(userId);
    if (cached) return cached;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: { include: { Permission: true } },
      },
    });

    if (!user || !user.role) throw new Error('Role not found');

    const permissions: Permission[] = user.role.Permission;
    const ability = this.abilityFactory.createForPermissions(
      permissions,
      userId,
    );

    abilityCache.set(userId, ability); // ✅ Cache secara lokal (bisa pakai Redis juga)

    return ability;
  }

  clearCache(userId: number) {
    abilityCache.delete(userId);
  }
}