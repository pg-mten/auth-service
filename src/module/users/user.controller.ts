import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { AuthInfoDto } from '../auth/dto/auth.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role } from 'src/shared/constant/auth.constant';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @Get('/user/authinfo')
  profile(@CurrentUser() user: AuthInfoDto) {
    return user;
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Get('/user/role')
  roles(@CurrentUser() user: AuthInfoDto) {
    return user;
  }
}
