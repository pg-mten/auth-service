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
