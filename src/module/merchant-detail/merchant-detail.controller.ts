import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { MerchantDetailService } from './merchant-detail.service';
import { CreateMerchantDetailDto } from './dto/create-merchant-detail.dto';
import { UpdateMerchantDetailDto } from './dto/update-merchant-detail.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { CheckPolicies } from '../casl/policy.decorator';
import { AppAbility } from '../casl/casl-ability.factory';
import { MerchantDto } from './dto/merchant.dto';
import { ResponseDto, ResponseStatus } from 'src/shared/response.dto';
import { MerchantNameDto } from './dto/merchant-names.dto';
import { Public } from '../auth/decorator/public.decorator';

@ApiTags('Merchant Detail')
@ApiBearerAuth()
@Controller('merchant-detail')
export class MerchantDetailController {
  constructor(private readonly service: MerchantDetailService) {}

  @Post()
  create(
    @Body() dto: CreateMerchantDetailDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.service.create(userId, dto);
  }

  // TODO Pagination
  @Get()
  @CheckPolicies((ability: AppAbility) => ability.can('read', 'MerchantDetail'))
  @ApiOperation({ summary: 'List of Merchant' })
  @ApiOkResponse({ type: MerchantDto, isArray: true })
  findAll() {
    return this.service.findAll();
  }

  @Public()
  @Get('dropdown')
  @ApiOperation({ summary: 'List of Merchant Id and Name for dropdown' })
  @ApiOkResponse({ type: MerchantNameDto, isArray: true })
  findAllNames() {
    return this.service.findAllNames();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Merchant by id' })
  @ApiOkResponse({ type: MerchantDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneThrow(id);
  }

  @Patch('update/:id')
  @CheckPolicies((ability: AppAbility) =>
    ability.can('update', 'MerchantDetail'),
  )
  @ApiOperation({ summary: 'Update Merchant by id' })
  @ApiBody({ type: UpdateMerchantDetailDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMerchantDetailDto,
    @CurrentUser('id') userId: number,
  ) {
    await this.service.update(id, userId, dto);
    return new ResponseDto({ status: ResponseStatus.UPDATED });
  }
}
