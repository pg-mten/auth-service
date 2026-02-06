import { AuthInfoDto } from 'src/microservice/auth/dto/auth-info.dto';
import { CryptoHelper } from 'src/shared/helper/crypto.helper';
import { PrismaClient } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { PRISMA_SERVICE } from '../prisma/prisma.provider';
import { MerchantSignatureStatusEnum } from 'src/shared/constant/auth.constant';
import { FilterMerchantSignatureValidationSystemDto } from 'src/microservice/merchant-signature/filter-merchant-signature-validation.system.dto';
import { MerchantSignatureValidationSystemDto } from 'src/microservice/merchant-signature/merchant-signature-validation.system.dto';

export class MerchantSignatureService {
  constructor(@Inject(PRISMA_SERVICE) private readonly prisma: PrismaClient) {}

  async generateSecretKey(authInfo: AuthInfoDto) {
    const { userId } = authInfo;
    const sharedSecretKey = CryptoHelper.generatedSharedSecretKey();
    const merchantSignature =
      await this.prisma.merchantSignature.findUniqueOrThrow({
        where: { userId },
      });

    await this.prisma.merchantSignature.update({
      where: { userId },
      data: {
        secretKey: sharedSecretKey,
        previousSecretKey: merchantSignature.secretKey,
      },
    });

    return sharedSecretKey;
  }

  async validateSignature(dto: FilterMerchantSignatureValidationSystemDto) {
    const { headers, method, path, body } = dto;
    // Get Merchant Shared Secret Key
    const merchantSignature = await this.prisma.merchantSignature.findUnique({
      where: { clientId: headers.xClientId },
    });

    if (!merchantSignature?.secretKey) {
      return new MerchantSignatureValidationSystemDto({
        isValid: false,
        userId: merchantSignature?.userId || 0,
        message: 'Merchant Secret Key not found',
      });
    }

    if (
      merchantSignature.status !== MerchantSignatureStatusEnum.ACTIVE.toString()
    ) {
      return new MerchantSignatureValidationSystemDto({
        isValid: false,
        userId: merchantSignature.userId,
        message: 'Merchant Signature Status is not Active',
      });
    }

    /// Rebuild Merchant Signature
    const stringToSign = CryptoHelper.buildStringToSign({
      method: method,
      path: path,
      timestamp: headers.xTimestamp,
      nonce: headers.xNonce,
      body: body,
    });

    // Timestamp
    if (!CryptoHelper.isTimestampValid(headers.xTimestamp)) {
      return new MerchantSignatureValidationSystemDto({
        isValid: false,
        userId: merchantSignature.userId,
        message: 'Request is expired',
      });
    }

    // TODO Nonce (Redis), makesure nonce is unique, not replayed and not used twice

    const signatureValid = CryptoHelper.verifySignature(
      merchantSignature.secretKey,
      stringToSign,
      headers.xSignature,
    );

    return new MerchantSignatureValidationSystemDto({
      isValid: signatureValid,
      userId: merchantSignature.userId,
      message: signatureValid ? 'Signature is valid' : 'Signature is invalid',
    });
  }

  async findMerchantByCliendIdOrThrow(clientId: string) {
    return this.prisma.merchantSignature.findFirstOrThrow({
      where: { clientId },
    });
  }

  // async validateSignatureRequest(merchantId: number, signature: string) {
  //   const merchant = await this.prisma.merchantDetail.findFirst({
  //     where: { userId: merchantId },
  //   });
  //   if (!merchant) {
  //     throw ResponseException.fromHttpExecption(
  //       new UnauthorizedException('Merchant Not Found'),
  //     );
  //   }
  //   const storedKey = CryptoHelper.decrypt(merchant.privateKey || '');
  //   if (storedKey !== signature) {
  //     throw ResponseException.fromHttpExecption(
  //       new UnauthorizedException('Signature not match'),
  //     );
  //   }
  //   return true;
  // }

  // async validateSignature(filter: FilterMerchantValidateSignatureSystemDto) {
  //   const { signature } = filter;
  //   if (!signature)
  //     throw ResponseException.fromHttpExecption(
  //       new UnauthorizedException('Signature is null'),
  //     );
  //   const storedKey = CryptoHelper.decrypt(signature);
  //   const [privateKey, authInfoParse] = storedKey.split(':');
  //   const authInfoDto = JSON.parse(authInfoParse) as AuthInfoDto;

  //   const merchant = await this.prisma.merchantDetail.findFirstOrThrow({
  //     where: { privateKey },
  //   });

  //   const dto = new MerchantValidateSignatureSystemDto({
  //     merchantId: merchant.id,
  //     authInfo: authInfoDto,
  //   });
  //   console.log({ dto });
  //   return dto;
  // }
}
