import { PrismaClient, User, Article } from '@prisma/client';
import { Action } from '../../../src/shared/constant/auth.constant';
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma';
import {
  AbilityBuilder,
  ExtractSubjectType,
  PureAbility,
  SubjectRawRule,
} from '@casl/ability';

type MySubjects = Subjects<{
  User: User;
  Article: Article;
}>;

export type AppSubjects =
  | 'all'
  | Subjects<{
      User: User;
      Article: Article;
    }>;

export type AppAbility = PureAbility<[string, AppSubjects], PrismaQuery>;
export async function permissionSeed(prisma: PrismaClient) {
  console.log('Permission Seeder');

  const { can, rules } = new AbilityBuilder<AppAbility>(createPrismaAbility);

  can(Action.manage, 'all', 'all');
  can(Action.read, 'Article');
  can(Action.update, 'Article', { authorId: 0 });
  // cannot(Action.DELETE, 'Article', { isPublished: true }); // Coba cara pake dibawah

  const rule: SubjectRawRule<
    string,
    ExtractSubjectType<AppSubjects>,
    PrismaQuery
  >[] = [
    {
      action: Action.delete,
      subject: 'Article',
      conditions: { isPublished: true },
      inverted: true,
      reason: 'Cannot delete published article',
    },
  ];
  rules.push(...rule);
  console.log(rules);

  for (const rule of rules) {
    const permissionCreated = await prisma.permission.create({
      data: {
        inverted: rule.inverted,
        action: rule.action.toString(),
        subject: rule.subject.toString(),
        condition: !rule.conditions ? undefined : Object(rule.conditions),
        reason: rule.reason,
      },
    });

    console.log({ permissionCreated });
  }
  console.log('TABLE');
  table('Article');
  table('User');
}

function table(data: MySubjects) {
  console.log('------------');
  console.log(data.toString());
  console.log(data.valueOf());
  console.log('------------');
}

// {
//   id: 3,
//   role_id: 2,
//   action: 'manage',
//   subject: 'Story',
//   conditions: { created_by: '{{ id }}' }
// }

/**
 * Admin
 * - manage article
 *
 * User
 * - Create article
 * - Read article
 * - Update own article
 * - Cannot delete own Article when published
 * -
 */
// model Permission {
//   id        Int    @id @default(autoincrement())
//   rule      Rule
//   action    String
//   subject   String
//   condition Json
