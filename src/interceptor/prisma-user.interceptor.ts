// src/common/interceptors/prisma-user.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { PRISMA_SERVICE } from '../module/prisma/prisma.provider';

@Injectable()
export class PrismaUserInterceptor implements NestInterceptor {
  constructor(@Inject(PRISMA_SERVICE) private prisma: PrismaClient) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const authInfo = (request as Request).authInfo;
    console.log('PrismaUserInterceptor.intercept');
    console.log({ authInfo });
    // this.prisma.setUserId(authInfo?.userId ?? null);
    return next.handle();
  }
}