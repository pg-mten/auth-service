import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MerchantSignatureService } from './merchant-signature.service';
import { AuthInfoDto } from 'src/microservice/auth/dto/auth-info.dto';
import { CurrentAuthInfo } from 'src/microservice/auth/decorator/current-auth-info.decorator';
import { SERVICES } from 'src/shared/constant/client.constant';
import { ResponseInterceptor } from 'src/shared/interceptor';
import { CustomValidationPipe } from 'src/shared/pipe';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SystemApi } from 'src/microservice/auth/decorator/system.decorator';
import { MerchantApi } from 'src/microservice/auth/decorator/merchant.decorator';
import { FilterMerchantSignatureValidationSystemDto } from 'src/microservice/merchant-signature/filter-merchant-signature-validation.system.dto';

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

  // @Get('/decrypt')
  // @PublicApi()
  // decyrptPrivateKey(
  //   @Headers('x-merchant-id') merchantId: string,
  //   @Headers('x-signature') signature: string,
  // ) {
  //   return this.merchantSignatureService.validateSignatureRequest(
  //     +merchantId,
  //     signature,
  //   );
  // }

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
}
