import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { AuthInfoDto } from '../auth/dto/auth.dto';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role } from 'src/shared/constant/auth.constant';
import { ProfileDto } from './dto/profile.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/user/profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Profile' })
  @ApiOkResponse({ type: ProfileDto })
  profile(@CurrentUser() authInfo: AuthInfoDto) {
    console.log({ authInfo });
    return this.userService.profile(authInfo);
  }

  @ApiBearerAuth()
  @Roles(Role.SUPER_ADMIN)
  @Get('/user/role')
  roles(@CurrentUser() user: AuthInfoDto) {
    return user;
  }
}
