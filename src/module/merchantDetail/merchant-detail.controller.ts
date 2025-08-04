import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { MerchantDetailService } from './merchant-detail.service';
import { CreateMerchantDetailDto } from './dto/create-merchant-detail.dto';
import { UpdateMerchantDetailDto } from './dto/update-merchant-detail.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { UpdateBalanceMerchantDto } from './dto/update-balance.dto';

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

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch('update/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMerchantDetailDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.service.update(+id, userId, dto);
  }

  @Get('me')
  getMyDetail(@CurrentUser('id') userId: number) {
    return this.service.getByUserId(userId);
  }

  @Patch('update-balance/:id')
  updateBalance(
    @Param('id') id: string,
    @Body() dto: UpdateBalanceMerchantDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.service.updateBalance(+id, userId, +dto.balance);
  }
}
