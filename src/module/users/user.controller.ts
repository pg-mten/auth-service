import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorator/roles.decorator';
import { ROLE } from 'src/shared/constant/auth.constant';
import { ProfileDto } from './dto/profile.dto';
import { Public } from '../auth/decorator/public.decorator';
import { UserProfileService } from './user-profile.service';
import { CreateMerchantDto } from '../merchant-detail/dto/create-merchant.dto';
import { ResponseDto, ResponseStatus } from 'src/shared/response.dto';
import { CreateAgentDto } from '../agent-detail/dto/create-agent.dto';
import { FilterMerchantsAndAgentsByIdsSystemDto } from 'src/microservice/auth/dto-system/filter-merchants-and-agents-by-ids.system.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SERVICES } from 'src/shared/constant/client.constant';
import { ResponseInterceptor } from 'src/interceptor/response.interceptor';
import { CustomValidationPipe } from 'src/pipe/custom-validation.pipe';
import { AuthInfoDto } from '../auth/dto/auth-info.dto';
import { CurrentAuthInfo } from '../auth/decorator/current-auth-info.decorator';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userProfileService: UserProfileService,
  ) {}

  @Get('/generate-private-key')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate Private Key' })
  generatePrivateKey(@CurrentAuthInfo() authInfo: AuthInfoDto) {
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
  profile(@CurrentAuthInfo() authInfo: AuthInfoDto) {
    console.log({ authInfo });
    return this.userProfileService.profile(authInfo);
  }

  @Get('role')
  @ApiBearerAuth()
  @Roles(ROLE.ADMIN_SUPER)
  roles(@CurrentAuthInfo() authInfo: AuthInfoDto) {
    return authInfo;
  }

  @Get()
  @Public()
  findAll() {
    return this.userService.findAll();
  }

  @Post('admin/register-merchant')
  @ApiOperation({ summary: 'Admin Register Merchant' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateMerchantDto })
  @Public()
  async registerMerchant(@Body() body: CreateMerchantDto) {
    console.log({ body });
    await this.userService.registerMerchant(body);
    return new ResponseDto({ status: ResponseStatus.CREATED });
  }

  @Post('admin/register-agent')
  @ApiOperation({ summary: 'Admin Register Agent' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateAgentDto })
  async registerAgent(@Body() body: CreateAgentDto) {
    await this.userService.registerAgent(body);
    return new ResponseDto({ status: ResponseStatus.CREATED });
  }

  @Public()
  @ApiTags('Internal')
  @Get('internal/merchants-and-agents-by-ids')
  findAllMerchantsAndAgentsByIds(
    @Query() filter: FilterMerchantsAndAgentsByIdsSystemDto,
  ) {
    console.log({ filter });
    return this.userService.findAllMerchantsAndAgentsByIds(filter);
  }

  @MessagePattern({
    cmd: SERVICES.AUTH.cmd.find_all_merchants_and_agents_by_ids,
  })
  @UseInterceptors(ResponseInterceptor)
  async findAllMerchantsAndAgentsByIdsTCP(
    @Payload(CustomValidationPipe)
    payload: FilterMerchantsAndAgentsByIdsSystemDto,
  ) {
    console.log({ payload });
    return this.userService.findAllMerchantsAndAgentsByIds(payload);
  }
}
