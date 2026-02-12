import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MerchantSignatureService } from './merchant-signature.service';
import { AuthInfoDto } from 'src/microservice/auth/dto/auth-info.dto';
import { CurrentAuthInfo, SystemApi } from 'src/microservice/auth/decorator';
import { SERVICES } from 'src/shared/constant/client.constant';
import { CustomValidationPipe } from 'src/shared/pipe';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FilterMerchantSignatureValidationSystemDto } from 'src/microservice/merchant-signature/filter-merchant-signature-validation.system.dto';
import { FilterMerchantUrlSystemDto } from 'src/microservice/merchant-signature/filter-merchant-url.system.dto';
import { MerchantSignatureHeaderDto, MerchantSignatureHeader } from 'src/microservice/merchant-signature/merchant-signature.header.decorator';

@ApiTags('Merchant Signature')
@ApiExtraModels(MerchantSignatureHeaderDto)
@Controller('merchant-signature')
export class MerchantSignatureController {
  constructor(private readonly service: MerchantSignatureService) { }

  @Get('/generate-secret-key')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate Secret Key' })
  generateSecretKey(@CurrentAuthInfo() authInfo: AuthInfoDto) {
    return this.service.generateSecretKey(authInfo);
  }

  @SystemApi()
  @Get('/internal/validate-signature')
  @ApiTags('Internal')
  @ApiHeader({ name: 'x-client-id', required: true })
  @ApiHeader({ name: 'x-timestamp', required: true })
  @ApiHeader({ name: 'x-nonce', required: true })
  @ApiHeader({ name: 'x-signature', required: true })
  @ApiHeader({ name: 'x-sign-alg', required: true })
  validateSignature(
    @Query() filter: FilterMerchantSignatureValidationSystemDto,
    @MerchantSignatureHeader() headers: MerchantSignatureHeaderDto,
  ) {
    filter.headers = headers;
    return this.service.validateSignature(filter);
  }

  @MessagePattern({ cmd: SERVICES.AUTH.cmd.merchant_signature_validation })
  validateSignatureTCP(
    @Payload(CustomValidationPipe)
    payload: FilterMerchantSignatureValidationSystemDto,
  ) {
    return this.service.validateSignature(payload);
  }

  @SystemApi()
  @Get('/internal/merchant-url')
  @ApiTags('Internal')
  getMerchantUrl(@Query() filter: FilterMerchantUrlSystemDto) {
    return this.service.findMerchantUrl(filter);
  }

  @MessagePattern({ cmd: SERVICES.AUTH.cmd.merchant_signature_url })
  getMerchantUrlTCP(
    @Payload(CustomValidationPipe)
    payload: FilterMerchantUrlSystemDto,
  ) {
    return this.service.findMerchantUrl(payload);
  }
}
