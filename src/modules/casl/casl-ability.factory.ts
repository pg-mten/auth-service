import {
  PureAbility,
  RawRuleOf,
  ForcedSubject,
  AbilityTuple,
  CreateAbility,
  buildMongoQueryMatcher,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { Permission } from '@prisma/client';

// 🎯 Step 1: Tentukan actions dan subjects
export const actions = [
  'manage',
  'create',
  'read',
  'update',
  'delete',
] as const;
export const subjects = [
  'Permission',
  'Role',
  'AgentDetail',
  'MerchantDetail',
  'all',
] as const;

// 🎯 Step 2: Define type tuple
export type AppAction = (typeof actions)[number];
export type AppSubject = (typeof subjects)[number];

// 🎯 Step 3: Ability tuple untuk definisi CASL
export type AppAbilities = AbilityTuple<
  AppAction,
  AppSubject | ForcedSubject<Exclude<AppSubject, 'all'>>
>;

// 🎯 Step 4: Instance dari ability
export type AppAbility = PureAbility<AppAbilities>;

// 🎯 Step 5: Create function dengan type helper
export const createAbility: CreateAbility<AppAbility> = (rules) =>
  new PureAbility<AppAbilities>(rules, {
    conditionsMatcher: buildMongoQueryMatcher(),
  });

@Injectable()
export class CaslAbilityFactory {
  createForPermissions(permissions: Permission[], userId?: number): AppAbility {
    const rules: RawRuleOf<AppAbility>[] = permissions.map((perm) => {
      let conditions = perm.conditions;
      console.log(perm.conditions);
      if (conditions && typeof conditions === 'object') {
        try {
          const str = JSON.stringify(conditions);
          conditions = JSON.parse(
            str.replace(/"\$userId"/g, JSON.stringify(userId)),
          );
        } catch (err) {
          console.error(
            'Failed to parse permission conditions:',
            perm.conditions,
            err,
          );
        }
      }
      return {
        action: perm.action as AppAction,
        subject: perm.subject as AppSubject,
        inverted: perm.inverted,
        fields: perm.field?.length ? perm.field : undefined,
        reason: perm.reason ?? undefined,
        conditions: conditions ?? undefined,
      };
    });

    return createAbility(rules);
  }
}
