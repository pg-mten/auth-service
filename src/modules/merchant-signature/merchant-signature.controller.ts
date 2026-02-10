import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MerchantSignatureService } from './merchant-signature.service';
import { AuthInfoDto } from 'src/microservice/auth/dto/auth-info.dto';
import {
  CurrentAuthInfo,
  SystemApi,
  MerchantApi,
} from 'src/microservice/auth/decorator';
import { SERVICES } from 'src/shared/constant/client.constant';
import { ResponseInterceptor } from 'src/shared/interceptor';
import { CustomValidationPipe } from 'src/shared/pipe';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FilterMerchantSignatureValidationSystemDto } from 'src/microservice/merchant-signature/filter-merchant-signature-validation.system.dto';
import { FilterMerchantUrlSystemDto } from 'src/microservice/merchant-signature/filter-merchant-url.system.dto';

@ApiTags('Merchant Signature')
@Controller('merchant-signature')
export class MerchantSignatureController {
  constructor(private readonly service: MerchantSignatureService) {}

  @Get('/generate-secret-key')
  @MerchantApi()
  @ApiOperation({ summary: 'Generate Secret Key' })
  generateSecretKey(@CurrentAuthInfo() authInfo: AuthInfoDto) {
    return this.service.generateSecretKey(authInfo);
  }

  @SystemApi()
  @Get('/internal/validate-signature')
  validateSignature(
    @Query() filter: FilterMerchantSignatureValidationSystemDto,
  ) {
    return this.service.validateSignature(filter);
  }

  @MessagePattern({ cmd: SERVICES.AUTH.cmd.merchant_signature_validation })
  @UseInterceptors(ResponseInterceptor)
  validateSignatureTCP(
    @Payload(CustomValidationPipe)
    payload: FilterMerchantSignatureValidationSystemDto,
  ) {
    return this.service.validateSignature(payload);
  }

  @SystemApi()
  @Get('/internal/merchant-url')
  getMerchantUrl(@Query() filter: FilterMerchantUrlSystemDto) {
    return this.service.findMerchantUrl(filter);
  }

  @MessagePattern({ cmd: SERVICES.AUTH.cmd.merchant_signature_url })
  @UseInterceptors(ResponseInterceptor)
  getMerchantUrlTCP(
    @Payload(CustomValidationPipe)
    payload: FilterMerchantUrlSystemDto,
  ) {
    return this.service.findMerchantUrl(payload);
  }
}
