import { Injectable } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { AuthHelper } from 'src/shared/helper/auth.helper';
import { AuthDto } from './dto/auth.dto';
import { instanceToPlain } from 'class-transformer';
import { AuthInfoDto } from '../../microservice/auth/dto/auth-info.dto';
import { UserProfileService } from '../users/user-profile.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly userProfileService: UserProfileService,
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
        if (isPasswordVerify) {
          const profileId =
            await this.userProfileService.findProfileIdByUserIdAndRole(
              user.id,
              user.role.name,
            );
          const authInfoDto = new AuthInfoDto({
            userId: user.id,
            profileId: profileId,
            role: user.role.name,
          });
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
    const payload = instanceToPlain(authInfoDto);
    const jwtToken = await this.jwtService.signAsync(payload);
    return new AuthDto({
      token: jwtToken,
      authInfo: authInfoDto,
    });
  }
}
