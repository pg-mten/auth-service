import { Controller, Get, Request, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from '../auth/decorator/public.decorator';

@Controller('app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('')
  getHello(): string {
    return this.appService.getHello();
  }
}
