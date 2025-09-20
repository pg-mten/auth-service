import { AuthInfoDto } from 'src/microservice/auth/dto/auth-info.dto';
import { CryptoHelper } from 'src/shared/helper/crypto.helper';
import { PrismaService } from '../prisma/prisma.service';
import { DateHelper } from 'src/shared/helper/date.helper';
import { UnauthorizedException } from '@nestjs/common';
import { ResponseException } from 'src/exception/response.exception';
import { MerchantValidateSignatureSystemDto } from 'src/microservice/auth/dto-system/merchant-validate-signature.system.dto';
import { FilterMerchantValidateSignatureSystemDto } from 'src/microservice/auth/dto-system/filter-merchant-validate-signature.system.dto';

export class MerchantSignatureService {
  constructor(private readonly prisma: PrismaService) {}

  async generatePrivateKey(authInfo: AuthInfoDto) {
    const { userId } = authInfo;
    const privateKey = CryptoHelper.generatePrivateKey();
    console.log(privateKey);
    const encryptedKey = CryptoHelper.encrypt(
      privateKey + ':' + JSON.stringify(authInfo),
    );
    await this.prisma.merchantDetail.update({
      data: {
        privateKey: encryptedKey,
        timestampPrivateKey: DateHelper.now().toString(),
      },
      where: {
        userId,
      },
    });
    return {
      privateKey,
      message: 'Success generate Private Key',
    };
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

  async validateSignature(filter: FilterMerchantValidateSignatureSystemDto) {
    const { signature } = filter;
    if (!signature)
      throw ResponseException.fromHttpExecption(
        new UnauthorizedException('Signature is null'),
      );
    const storedKey = CryptoHelper.decrypt(signature);
    const [privateKey, authInfoParse] = storedKey.split(':');
    const authInfoDto = JSON.parse(authInfoParse) as AuthInfoDto;

    const merchant = await this.prisma.merchantDetail.findFirstOrThrow({
      where: { privateKey },
    });

    const dto = new MerchantValidateSignatureSystemDto({
      merchantId: merchant.id,
      authInfo: authInfoDto,
    });
    console.log({ dto });
    return dto;
  }
}
