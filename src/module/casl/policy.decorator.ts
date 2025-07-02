import { SetMetadata } from '@nestjs/common';
import { AppAbility } from './casl-ability.factory';

// Define a policy handler function: menerima ability dan mengembalikan boolean
export type PolicyHandler = (ability: AppAbility) => boolean;

// Metadata key
export const CHECK_POLICIES_KEY = 'check_policy';

// Decorator utama
export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);
