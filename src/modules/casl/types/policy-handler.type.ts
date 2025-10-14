import { AppAbility } from '../casl-ability.factory';

export interface IPolicyHandler {
  handle(ability: AppAbility): boolean;
}

export type PolicyHandler = ((ability: AppAbility) => boolean) | IPolicyHandler;
