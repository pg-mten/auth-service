import { Module } from '@nestjs/common';
import { CaslAbilityFactory } from './casl-ability.factory';

@Module({
  providers: [CaslAbilityFactory],
  exports: [CaslAbilityFactory],
})
<<<<<<< HEAD
export class CaslModule {}
=======
export class CashModule {}
>>>>>>> 37b995eb6627f9c151a732bc5a7be07760b63761
