import {
  Body,
  Controller,
  Get,
  Head,
  Headers,
  Post,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { AuthInfoDto } from '../auth/dto/auth.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role } from 'src/shared/constant/auth.constant';
import { ProfileDto } from './dto/profile.dto';
import { Public } from '../auth/decorator/public.decorator';
import { UserProfileService } from './user-profile.service';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { ResponseDto, ResponseStatus } from 'src/shared/response.dto';
import { CreateAgentDto } from './dto/create-agent.dto';
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userProfileService: UserProfileService,
  ) {}

  @Get('/generate-private-key')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate Private Key' })
  generatePrivateKey(@CurrentUser() authInfo: AuthInfoDto) {
    return this.userProfileService.generatePrivateKey(authInfo);
  }

  @Get('/decrypt')
  @Public()
  decyrptPrivateKey(
    @Headers('x-merchant-id') merchantId: string,
    @Headers('x-signature') signature: string,
  ) {
    return this.userProfileService.validateSignatureRequest(
      +merchantId,
      signature,
    );
  }

  @Get('/profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Profile' })
  @ApiOkResponse({ type: ProfileDto })
  profile(@CurrentUser() authInfo: AuthInfoDto) {
    console.log({ authInfo });
    return this.userProfileService.profile(authInfo);
  }

  @Get('role')
  @ApiBearerAuth()
  @Roles(Role.ADMIN_SUPER)
  roles(@CurrentUser() authInfo: AuthInfoDto) {
    return authInfo;
  }

  @Get()
  @Public()
  findAll() {
    return this.userService.findAll();
  }

  @Post('admin/register-merchant')
  @Roles(Role.ADMIN_SUPER, Role.ADMIN_MERCHANT, Role.ADMIN_ROLE_PERMISSION)
  @ApiOperation({ summary: 'Admin Register Merchant' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateMerchantDto })
  async registerMerchant(@Body() body: CreateMerchantDto) {
    await this.userService.registerMerchant(body);
    return new ResponseDto({ status: ResponseStatus.CREATED });
  }

  @Post('admin/register-agent')
  @Roles(Role.ADMIN_SUPER, Role.ADMIN_AGENT, Role.ADMIN_ROLE_PERMISSION)
  @ApiOperation({ summary: 'Admin Register Agent' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateAgentDto })
  async registerAgent(@Body() body: CreateAgentDto) {
    await this.userService.registerAgent(body);
    return new ResponseDto({ status: ResponseStatus.CREATED });
  }

  @Public()
  @Get('internal/merchants-and-agents-by-ids')
  internalfindAllMerchantsAndAgentsByIds(
    @Query('merchantIds') merchantIds: string,
    @Query('agentIds') agentIds: string,
  ) {
    console.log({ merchantIds, agentIds });
    const merchantIdList = merchantIds.split(',').map(Number);
    const agentIdList = agentIds.split(',').map(Number);
    console.log({ merchantIdList, agentIdList });
    return this.userService.internalfindAllMerchantsAndAgentsByIds(
      merchantIdList,
      agentIdList,
    );
  }
}
