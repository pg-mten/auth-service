import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';
import { User } from '../user/user.service';
import { ResponseException } from 'src/exception/response.exception';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(
    username: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    console.log('LocalStrategy.validate');
    const user = await this.authService.validateUser(username, password);
    if (!user) ResponseException.fromHttpExecption(new UnauthorizedException());
    return user;
  }
}
