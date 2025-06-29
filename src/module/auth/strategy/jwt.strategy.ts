import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT } from 'src/shared/constant/auth.constant';
import { AuthInfoDto } from '../dto/auth.dto';

export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT.accessToken.secret,
    });
  }

  validate(payload: any): unknown {
    // return { userId: payload.sub, username: payload.username };
    console.log('JwtStrategy.validate');
    console.log({ payload });
    return payload as AuthInfoDto;
  }
}
