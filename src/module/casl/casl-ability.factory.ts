<<<<<<< HEAD
import {
  AbilityBuilder,
  ExtractSubjectType,
  PureAbility,
  SubjectRawRule,
} from '@casl/ability';
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma';
import { Article, User, Permission } from '@prisma/client';
import { Inject, Injectable } from '@nestjs/common';
import { AuthInfoDto } from '../auth/dto/auth.dto';
import { ExtendedPrismaClient } from '../prisma/prisma.extension';
import { CustomPrismaService } from 'nestjs-prisma';

type MySubjects = Subjects<{
  User: User;
  Article: Article;
}>;

export type AppSubjects = 'all' | MySubjects;

export type AppAbility = PureAbility<[string, AppSubjects], PrismaQuery>;

@Injectable()
export class CaslAbilityFactory {
  constructor(
    @Inject('PrismaService')
    private readonly prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}
  async createForUser(authInfo: AuthInfoDto, subject: string, actions: string) {
    console.log('CaslAbilityFactory.createForUser');
    const { can, rules, build } = new AbilityBuilder<AppAbility>(
      createPrismaAbility,
    );

    const userPermissions = await this.prisma.client.userPermission.findMany({
      where: {
        userId: authInfo.id,
        permission: {
          subject: subject,
          action: actions,
        },
      },
      include: { permission: true },
    });

    console.log({ userPermissions });

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
        // conditions: this.parseCondition(permission, authInfo),
        conditions: this.parseCondition(permission, authInfo),
        // { authorId: 3 },
        // this.parseCondition(permission, authInfo),
        // conditions: !permission.condition
        //   ? undefined
        //   : Object(permission.condition),
        inverted: permission.inverted,
        reason: permission.reason ?? undefined,
      };
      console.log(rule);
      return rule;
    });

    // rules.push(...permissions);
    can('read', 'Article');
    can('update', 'Article', { authorId: 1 });
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

// @Injectable()
// export class CaslAbilityFactory {
//   createForUser(user: User & { role: Role }) {
//     const { can, cannot, build } = new AbilityBuilder<AppAbility>(
//       createPrismaAbility,
//     );

//     if (user.role.name === RoleEnum.ADMIN.toString()) {
//       // can(Action.MANAGE, 'User'); // read-write access to everything
//       can(Action.MANAGE, 'all', 'all');
//     } else {
//       // can(Action.READ, 'Article');
//       can(Action.READ, 'Article');
//     }

//     can(Action.UPDATE, 'Article', { authorId: user.id });
//     cannot(Action.DELETE, 'Article', { isPublished: true });

//     return build();
//   }
// }
=======
import { AbilityBuilder, PureAbility } from '@casl/ability';
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma';
import { Article, User, Role } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { Action, Role as RoleEnum } from 'src/shared/constant/auth.constant';

export type AppSubjects =
  | 'all'
  | Subjects<{
      user: User;
      article: Article;
    }>;

export type AppAbility = PureAbility<[string, AppSubjects], PrismaQuery>;

// const { can, cannot } = new AbilityBuilder<AppAbility>(createPrismaAbility);

// type Subjects = InferSubjects<User | Article> | 'all';

// export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User & { role: Role }) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createPrismaAbility,
    );

    if (user.role.name === RoleEnum.ADMIN.toString()) {
      // can(Action.MANAGE, 'User'); // read-write access to everything
      can(Action.MANAGE, 'all', 'all');
    } else {
      // can(Action.READ, 'Article');
      can(Action.READ, 'article');
    }

    can(Action.UPDATE, 'article', { authorId: user.id });
    cannot(Action.DELETE, 'article', { isPublished: true });

    return build();
  }
}
>>>>>>> 37b995eb6627f9c151a732bc5a7be07760b63761
