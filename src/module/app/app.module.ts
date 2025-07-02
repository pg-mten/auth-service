import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from 'nestjs-prisma';
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
import { ArticleModule } from '../article/article.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ArticleModule,
    PrismaModule,
    /// System Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
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

    /// GUARD
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
