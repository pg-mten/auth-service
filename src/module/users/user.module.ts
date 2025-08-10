import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserProfileService } from './user-profile.service';
import { EmailUniqueValidator } from './validator/email-unique.validator';
import { UsernameUniqueValidator } from './validator/username-unique.validator';
import { AgentDetailModule } from '../agent-detail/agent-detail.module';
import { MerchantDetailModule } from '../merchant-detail/merchant-detail.module';

@Module({
  controllers: [UserController],
  imports: [AgentDetailModule, MerchantDetailModule],
  providers: [
    UserService,
    UserProfileService,
    EmailUniqueValidator,
    UsernameUniqueValidator,
  ],
  exports: [
    UserService,
    UserProfileService,
    EmailUniqueValidator,
    UsernameUniqueValidator,
  ],
})
export class UserModule {}
