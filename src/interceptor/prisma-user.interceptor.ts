// src/common/interceptors/prisma-user.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { PrismaService } from '../module/prisma/prisma.service';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class PrismaUserInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const authInfo = (request as Request).user;
    console.log('PrismaUserInterceptor.intercept');
    console.log({ authInfo });
    this.prisma.setUserId(authInfo?.id ?? null);
    return next.handle();
  }
}
