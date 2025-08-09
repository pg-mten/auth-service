import { Injectable } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { AuthHelper } from 'src/shared/helper/auth.helper';
import { AuthDto, AuthInfoDto } from './dto/auth.dto';
import { plainToClass, instanceToPlain } from 'class-transformer';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<AuthInfoDto | null> {
    const { email, password } = loginDto;
    try {
      const user = await this.userService.findOneByEmailThrow(email);
      if (user) {
        const isPasswordVerify = await AuthHelper.verifyPassword(
          user.password,
          password,
        );
        if (user && isPasswordVerify) {
          const authInfoDto = plainToClass(AuthInfoDto, user, {
            excludeExtraneousValues: true,
          });
          authInfoDto.role = user.role.name;
          return authInfoDto;
        }
      }

      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async login(authInfoDto: AuthInfoDto): Promise<AuthDto> {
    console.log({ authInfoDto });
    // const payload: TokenPayload = plainToClass(TokenPayload, authInfoDto);
    const payload = instanceToPlain(authInfoDto);
    const jwtToken = await this.jwtService.signAsync(payload);
    return {
      token: jwtToken,
      authInfo: authInfoDto,
    } as AuthDto;
  }
}
