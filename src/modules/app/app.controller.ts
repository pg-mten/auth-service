import { Controller, Get, Request, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { PublicApi } from 'src/microservice/auth/decorator/public.decorator';

@Controller('app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @PublicApi()
  @Get('')
  getHello(): string {
    return this.appService.getHello();
  }
}
