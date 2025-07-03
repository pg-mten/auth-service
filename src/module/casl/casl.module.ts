import { Global, Module } from '@nestjs/common';
import { CaslAbilityFactory } from './casl-ability.factory';
import { CaslCacheService } from './casl-cache.service';
import { PoliciesGuard } from './policies.guard';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';

@Global() // optional, kalau mau semua module bisa akses tanpa import manual
@Module({
  providers: [
    PrismaService,
    CaslAbilityFactory,
    CaslCacheService,
    Reflector,
    {
      provide: APP_GUARD, // untuk menjadikan PoliciesGuard sebagai global guard
      useClass: PoliciesGuard,
    },
  ],
  exports: [CaslAbilityFactory, CaslCacheService],
})
export class CaslModule {}
