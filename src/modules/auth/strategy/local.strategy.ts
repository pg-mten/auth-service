import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { ResponseException } from 'src/exception/response.exception';
import { AuthInfoDto } from '../../../microservice/auth/dto/auth-info.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<AuthInfoDto | null> {
    const authInfo = await this.authService.validateUser({ email, password });
    if (!authInfo)
      ResponseException.fromHttpExecption(new UnauthorizedException());
    console.log({ authInfo });
    return authInfo;
  }
}
