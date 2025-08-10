import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import {
  APP_FILTER,
  APP_GUARD,
  APP_INTERCEPTOR,
  APP_PIPE,
  Reflector,
} from '@nestjs/core';
import { CustomValidationPipe } from 'src/pipe/custom-validation.pipe';
import { PrismaClientKnownExceptionFilter } from 'src/filter/prisma-client-known.exception.filter';
import { ResponseExceptionFilter } from 'src/filter/response.exception.filter';
import { InvalidRequestExceptionFilter } from 'src/filter/invalid-request.exception.filter';
import { ResponseInterceptor } from 'src/interceptor/response.interceptor';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UserModule } from '../users/user.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { RolesModule } from '../roles/roles.module';
import { PrismaUserInterceptor } from '../../interceptor/prisma-user.interceptor';
import { PrismaService } from '../prisma/prisma.service';
import { AgentDetailModule } from '../agent-detail/agent-detail.module';
import { MerchantDetailModule } from '../merchant-detail/merchant-detail.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RolesGuard } from '../auth/guard/roles.guard';
import { PoliciesGuard } from '../casl/policies.guard';
import { CaslModule } from '../casl/casl.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    PrismaModule,
    PermissionsModule,
    RolesModule,
    AgentDetailModule,
    MerchantDetailModule,
    /// System Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
    }),
    CaslModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    /// PIPE
    {
      provide: APP_PIPE,
      useClass: CustomValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaClientKnownExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ResponseExceptionFilter,
    },
    {
      provide: APP_FILTER, // Highest priority
      useClass: InvalidRequestExceptionFilter,
    },

    /// INTERCEPTOR
    {
      provide: APP_INTERCEPTOR,
      useFactory: (reflector: Reflector) => {
        return new ClassSerializerInterceptor(reflector);
      },
      inject: [Reflector],
    },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    {
      provide: APP_INTERCEPTOR,
      useFactory: (prisma: PrismaService) => new PrismaUserInterceptor(prisma),
      inject: [PrismaService],
    },
    /// GUARD
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PoliciesGuard,
    },
  ],
})
export class AppModule {}
