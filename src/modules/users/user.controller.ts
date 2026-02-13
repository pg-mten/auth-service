import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../microservice/auth/decorator/roles.decorator';
import { ROLE } from 'src/shared/constant/auth.constant';
import { ProfileDto } from './dto/profile.dto';
import { PublicApi, SystemApi } from 'src/microservice/auth/decorator';
import { UserProfileService } from './user-profile.service';
import { CreateMerchantDto } from '../merchant-detail/dto/create-merchant.dto';
import { ResponseDto, ResponseStatus } from 'src/shared/response.dto';
import { CreateAgentDto } from '../agent-detail/dto/create-agent.dto';
import { FilterMerchantsAndAgentsByIdsSystemDto } from 'src/microservice/auth/dto-system/filter-merchants-and-agents-by-ids.system.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SERVICES } from 'src/shared/constant/client.constant';
import { CustomValidationPipe } from 'src/shared/pipe/custom-validation.pipe';
import { AuthInfoDto } from '../../microservice/auth/dto/auth-info.dto';
import { CurrentAuthInfo } from '../../microservice/auth/decorator/current-auth-info.decorator';
import { FilterProfileBankSystemDto } from 'src/microservice/auth/dto-system/filter-profile-bank.system.dto';

@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userProfileService: UserProfileService,
  ) {}

  @Get('user/profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Profile' })
  @ApiOkResponse({ type: ProfileDto })
  profile(@CurrentAuthInfo() authInfo: AuthInfoDto) {
    console.log({ authInfo });
    return this.userProfileService.profile(authInfo);
  }

  @Get('user/role')
  @ApiBearerAuth()
  @Roles(ROLE.ADMIN_SUPER)
  roles(@CurrentAuthInfo() authInfo: AuthInfoDto) {
    return authInfo;
  }

  @Get('user')
  @PublicApi()
  findAll() {
    return this.userService.findAll();
  }

  @Post('user/admin/register-merchant')
  @ApiOperation({ summary: 'Admin Register Merchant' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateMerchantDto })
  async registerMerchant(
    @CurrentAuthInfo() authInfo: AuthInfoDto,
    @Body() body: CreateMerchantDto,
  ) {
    console.log({ authInfo, body });
    await this.userService.registerMerchant(authInfo, body);
    return new ResponseDto({ status: ResponseStatus.CREATED });
  }

  @Post('user/admin/register-agent')
  @ApiOperation({ summary: 'Admin Register Agent' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateAgentDto })
  async registerAgent(@Body() body: CreateAgentDto) {
    await this.userService.registerAgent(body);
    return new ResponseDto({ status: ResponseStatus.CREATED });
  }

  @SystemApi()
  @ApiTags('Internal')
  @Get(SERVICES.AUTH.point.find_all_merchants_and_agents_by_ids.path)
  findAllMerchantsAndAgentsByIds(
    @Query() filter: FilterMerchantsAndAgentsByIdsSystemDto,
  ) {
    console.log({ filter });
    return this.userService.findAllMerchantsAndAgentsByIds(filter);
  }

  @MessagePattern({
    cmd: SERVICES.AUTH.point.find_all_merchants_and_agents_by_ids.cmd,
  })
  async findAllMerchantsAndAgentsByIdsTCP(
    @Payload(CustomValidationPipe)
    payload: FilterMerchantsAndAgentsByIdsSystemDto,
  ) {
    console.log({ payload });
    return this.userService.findAllMerchantsAndAgentsByIds(payload);
  }

  @SystemApi()
  @ApiTags('Internal')
  @Get(SERVICES.AUTH.point.find_profile_bank.path)
  async findProfileBank(@Query() filter: FilterProfileBankSystemDto) {
    console.log({ filter });
    return this.userProfileService.findProfileBank(filter);
  }

  @MessagePattern({ cmd: SERVICES.AUTH.point.find_profile_bank.cmd })
  async findProfileBankTCP(
    @Payload(CustomValidationPipe) payload: FilterProfileBankSystemDto,
  ) {
    console.log({ payload });
    return this.userProfileService.findProfileBank(payload);
  }
}
