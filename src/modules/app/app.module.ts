import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE, Reflector } from '@nestjs/core';
import { CustomValidationPipe } from 'src/shared/pipe/custom-validation.pipe';
import {
  PrismaClientKnownExceptionFilter,
  ResponseExceptionFilter,
  InvalidRequestExceptionFilter,
} from 'src/shared/filter';
import { ResponseInterceptor } from 'src/shared/interceptor/response.interceptor';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../users/user.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { RolesModule } from '../roles/roles.module';
import { AgentDetailModule } from '../agent-detail/agent-detail.module';
import { MerchantDetailModule } from '../merchant-detail/merchant-detail.module';
import { PrismaModule } from '../prisma/prisma.module';
import { CaslModule } from '../casl/casl.module';
import { MicroserviceModule } from 'src/microservice/microservice.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { MerchantSignatureModule } from '../merchant-signature/merchant-signature.module';

@Module({
  imports: [
    /// System Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
    }),
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
    }),
    MicroserviceModule,
    CaslModule,
    PrismaModule,

    /// Businness
    AuthModule,
    UserModule,
    PermissionsModule,
    RolesModule,
    AgentDetailModule,
    MerchantDetailModule,
    MerchantSignatureModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    /// PIPE
    {
      provide: APP_PIPE,
      useClass: CustomValidationPipe,
    },

    /// FILTER
    {
      provide: APP_FILTER, // Lowest priority
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
    {
      provide: APP_INTERCEPTOR,
      useFactory: (reflector: Reflector) => {
        return new ResponseInterceptor(reflector);
      },
      inject: [Reflector],
    },
  ],
})
export class AppModule {}
