import { AuthInfoDto } from 'src/microservice/auth/dto/auth-info.dto';
import { CryptoHelper } from 'src/shared/helper/crypto.helper';
import { PrismaClient } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { PRISMA_SERVICE } from '../prisma/prisma.provider';
import { MerchantSignatureStatusEnum } from 'src/shared/constant/auth.constant';
import { FilterMerchantSignatureValidationSystemDto } from 'src/microservice/merchant-signature/filter-merchant-signature-validation.system.dto';
import { MerchantSignatureValidationSystemDto } from 'src/microservice/merchant-signature/merchant-signature-validation.system.dto';
import { FilterMerchantUrlSystemDto } from 'src/microservice/merchant-signature/filter-merchant-url.system.dto';
import { MerchantUrlSystemDto } from 'src/microservice/merchant-signature/merchant-url.system.dto';

export class MerchantSignatureService {
  constructor(@Inject(PRISMA_SERVICE) private readonly prisma: PrismaClient) {}

  async findMerchantUrl(dto: FilterMerchantUrlSystemDto) {
    const merchantUrl = await this.prisma.merchantSignature.findFirstOrThrow({
      where: {
        userId: dto.userId,
      },
      select: {
        payinUrl: true,
        payoutUrl: true,
      },
    });

    return new MerchantUrlSystemDto({
      payinUrl: merchantUrl.payinUrl,
      payoutUrl: merchantUrl.payoutUrl,
    });
  }

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
}
