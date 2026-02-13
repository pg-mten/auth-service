import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MerchantSignatureService } from './merchant-signature.service';
import { AuthInfoDto } from 'src/microservice/auth/dto/auth-info.dto';
import { CurrentAuthInfo, SystemApi } from 'src/microservice/auth/decorator';
import { SERVICES } from 'src/shared/constant/client.constant';
import { CustomValidationPipe } from 'src/shared/pipe';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FilterMerchantSignatureValidationSystemDto } from 'src/microservice/merchant-signature/filter-merchant-signature-validation.system.dto';
import { FilterMerchantUrlSystemDto } from 'src/microservice/merchant-signature/filter-merchant-url.system.dto';

@ApiTags('Merchant Signature')
@Controller('merchant-signature')
export class MerchantSignatureController {
  constructor(private readonly service: MerchantSignatureService) { }

  @Get('merchant-signature/generate-secret-key')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate Secret Key' })
  generateSecretKey(@CurrentAuthInfo() authInfo: AuthInfoDto) {
    return this.service.generateSecretKey(authInfo);
  }

  @SystemApi()
  @Get(SERVICES.AUTH.point.merchant_signature_validation.path)
  @ApiTags('Internal')
  validateSignature(
    @Query() filter: FilterMerchantSignatureValidationSystemDto,
  ) {
    return this.service.validateSignature(filter);
  }

  @MessagePattern({
    cmd: SERVICES.AUTH.point.merchant_signature_validation.cmd,
  })
  validateSignatureTCP(
    @Payload(CustomValidationPipe)
    payload: FilterMerchantSignatureValidationSystemDto,
  ) {
    return this.service.validateSignature(payload);
  }

  @SystemApi()
  @Get(SERVICES.AUTH.point.merchant_signature_url.path)
  @ApiTags('Internal')
  getMerchantUrl(@Query() filter: FilterMerchantUrlSystemDto) {
    return this.service.findMerchantUrl(filter);
  }

  @MessagePattern({ cmd: SERVICES.AUTH.point.merchant_signature_url.cmd })
  getMerchantUrlTCP(
    @Payload(CustomValidationPipe)
    payload: FilterMerchantUrlSystemDto,
  ) {
    return this.service.findMerchantUrl(payload);
  }
}
