import * as Mustache from 'mustache';

import { map, size } from 'lodash';
import {
  createMongoAbility,
  ForbiddenError,
  ForcedSubject,
  MongoAbility,
  RawRuleOf,
  subject,
} from '@casl/ability';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from '../prisma/prisma.extension';
import { CHECK_ABILITY, RequiredRule } from './abilities.decorator';
import { User, Permission } from '@prisma/client';
import { Request } from 'express';

export const actions = [
  'read',
  'manage',
  'create',
  'update',
  'delete',
] as const;

export const subjects = ['Story', 'User', 'all'] as const;

export type Abilities = [
  (typeof actions)[number],
  (
    | (typeof subjects)[number]
    | ForcedSubject<Exclude<(typeof subjects)[number], 'all'>>
  ),
];

export type AppAbility = MongoAbility<Abilities>;

@Injectable()
export class AbilitiesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,

    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  createAbility = (rules: RawRuleOf<AppAbility>[]) => {
    return createMongoAbility<AppAbility>(rules);
  };

  parseCondition(permissions: any, currentUser: User): any {
    const data = map(permissions, (permission) => {
      if (size(permission.conditions)) {
        const parsedVal = Mustache.render(
          permission.conditions['created_by'],
          currentUser,
        );
        return {
          ...permission,
          conditions: { created_by: +parsedVal },
        };
      }
      return permission;
    });
    return data;
  }

  async getSubjectById(id: number, subName: string) {
    const subject = await this.prisma.client[subName].findUnique({
      where: {
        id,
      },
    });
    if (!subject) throw new NotFoundException(`${subName} not found`);
    return subject;
  }

  async canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const rules: any =
      this.reflector.get<RequiredRule[]>(CHECK_ABILITY, context.getHandler()) ||
      [];

    const currentUser: User = context.switchToHttp().getRequest().user;
    const request: Request = context.switchToHttp().getRequest();

    const userPermissions = await this.prisma.client.permission.findMany({
      where: {
        role_id: currentUser.role_id,
      },
    });

    const parsedUserPermissions = this.parseCondition(
      userPermissions,
      currentUser,
    );

    try {
      const ability = this.createAbility(Object(parsedUserPermissions));

      for await (const rule of rules) {
        let sub = {};
        if (size(rule?.conditions)) {
          const subId = +request.params['id'];
          sub = await this.getSubjectById(subId, rule.subject);
        }

        ForbiddenError.from(ability)
          .setMessage('You are not allowed to perform this action')
          .throwUnlessCan(rule.action, subject(rule.subject, sub));
      }
      return true;
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
      throw error;
    }
  }
}
