import {
  AbilityBuilder,
  ExtractSubjectType,
  PureAbility,
  SubjectRawRule,
} from '@casl/ability';
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma';
import { Article, Permission, User } from '@prisma/client';
import { Inject, Injectable } from '@nestjs/common';
import { AuthInfoDto } from '../auth/dto/auth.dto';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from '../prisma/prisma.extension';

type MySubjects = Subjects<{
  User: User;
  Article: Article;
}>;
type AppSubjects = MySubjects | 'all';

export type AppAbility = PureAbility<[string, AppSubjects], PrismaQuery>;
export enum ActionEnum {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

@Injectable()
export class CaslAbilityFactory {
  constructor(
    @Inject('PrismaService')
    private readonly prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}
  async createForUser(authInfo: AuthInfoDto): Promise<AppAbility> {
    const { rules, build } = new AbilityBuilder<AppAbility>(
      createPrismaAbility,
    );
    const userPermissions = await this.prisma.client.userPermission.findMany({
      where: {
        userId: authInfo.id,
      },
      include: {
        permission: true,
      },
    });

    const permissions: SubjectRawRule<
      string,
      ExtractSubjectType<AppSubjects>,
      PrismaQuery
    >[] = userPermissions.map((userPermission) => {
      const permission = userPermission.permission;
      const rule: SubjectRawRule<
        string,
        ExtractSubjectType<AppSubjects>,
        PrismaQuery
      > = {
        action: permission.action,
        subject: permission.subject as ExtractSubjectType<AppSubjects>,
        conditions: this.parseCondition(permission, authInfo),
        inverted: permission.inverted,
        reason: permission.reason ?? undefined,
      };

      return rule;
    });
    rules.push(...permissions);

    return build();
  }
  private subject(data: MySubjects): string {
    return data.valueOf() as string;
  }
  private parseCondition(
    permission: Permission,
    authInfo: AuthInfoDto,
  ): PrismaQuery | undefined {
    // console.log('CaslAbilityFactory.parseCondition');
    // console.log({ permission });
    if (!permission.condition) return undefined;
    const obj = permission.condition as Record<string, any>;
    if (permission.subject === this.subject('Article')) {
      // console.log({ obj });
      // console.log(Object.keys(obj));

      if (Object.keys(obj).includes('authorId')) {
        const ooo: PrismaQuery = { authorId: authInfo.id };
        return ooo;
        // return { authorId: authInfo.id } as PrismaQuery;
        // return plainToClass(PrismaQuery, { authorId: authInfo.id });
      }
    }
    return obj as PrismaQuery;
  }
}
