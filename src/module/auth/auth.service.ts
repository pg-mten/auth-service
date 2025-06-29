import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
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
      const isPasswordVerify = await AuthHelper.verifyPassword(
        user.passwordHash,
        password,
      );
      if (user && isPasswordVerify) {
        const authInfoDto = plainToClass(AuthInfoDto, user, {
          excludeExtraneousValues: true,
        });
        return authInfoDto;
      }
      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async login(authInfoDto: AuthInfoDto): Promise<AuthDto> {
    // const payload: TokenPayload = plainToClass(TokenPayload, authInfoDto);
    const payload = instanceToPlain(authInfoDto);
    const jwtToken = await this.jwtService.signAsync(payload);
    return {
      token: jwtToken,
      user: authInfoDto,
    } as AuthDto;
  }
}
