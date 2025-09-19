import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../../microservice/auth/decorator/public.decorator';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { AuthDto } from './dto/auth.dto';
import { AuthInfoDto } from '../../microservice/auth/dto/auth-info.dto';
import { CurrentAuthInfo } from '../../microservice/auth/decorator/current-auth-info.decorator';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get('/hello')
  hello(): string {
    console.log('HELLO');
    return 'hello';
  }

  @Get('/authInfo')
  @ApiBearerAuth()
  token(@CurrentAuthInfo() authInfo: AuthInfoDto) {
    return authInfo;
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @ApiOperation({ summary: 'login for all Role' })
  @ApiBody({ type: LoginDto })
  @ApiCreatedResponse({ type: AuthDto })
  async login(@Req() req: Request) {
    console.log({ req });
    return this.authService.login(req.authInfo);
  }
}
