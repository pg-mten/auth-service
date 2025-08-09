import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { AuthInfoDto } from '../auth/dto/auth.dto';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role } from 'src/shared/constant/auth.constant';
import { Public } from '../auth/decorator/public.decorator';
import { ProfileDto } from './dto/profile.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/user/profile')
  @Public()
  // @ApiBearerAuth()
  @ApiOperation({ summary: 'Profile' })
  @ApiOkResponse({ type: ProfileDto })
  profile(@CurrentUser() user: AuthInfoDto) {
    console.log({ user });
    return this.userService.profile({
      email: 'aaa',
      id: 4,
      firstName: 'a',
      lastName: 'a',
      role: Role.ADMIN_MERCHANT,
    });
  }

  @ApiBearerAuth()
  @Roles(Role.SUPER_ADMIN)
  @Get('/user/role')
  roles(@CurrentUser() user: AuthInfoDto) {
    return user;
  }
}
