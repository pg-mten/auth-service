import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { AuthInfoDto } from '../auth/dto/auth.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @Get('/authinfo')
  profile(@CurrentUser() user: AuthInfoDto) {
    return user;
  }

  @ApiBearerAuth()
<<<<<<< HEAD
  @Roles(Role.admin)
=======
  @Roles(Role.ADMIN)
>>>>>>> 37b995eb6627f9c151a732bc5a7be07760b63761
  @Get('/roles')
  roles(@CurrentUser() user: AuthInfoDto) {
    return user;
  }
}
