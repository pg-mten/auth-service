import { Module } from '@nestjs/common';
import { UserModule } from '../users/user.module';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategy/local.strategy';
import { AuthController } from './auth.controller';

@Module({
  controllers: [AuthController],
  imports: [UserModule, PassportModule],
  providers: [AuthService, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
