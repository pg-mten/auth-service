import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthInfoDto } from '../auth/dto/auth.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from 'src/shared/constant/auth.constant';
import { ProfileDto } from './dto/profile.dto';
import { ProfileMerchantDetailDto } from './dto/profile-merchant.dto';
import { ProfileAgentDetailDto } from './dto/profile-agent.dto';
import { ProfieAdminDetailDto } from './dto/profile-admin.dto';
import { CryptoHelper } from 'src/shared/helper/crypto.helper';
import { DateHelper } from 'src/shared/helper/date.helper';
import * as crypto from 'crypto';
@Injectable()
export class UserProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async profile(authInfo: AuthInfoDto) {
    console.log({ authInfo });
    const role: Role = Object.values(Role).find(
      (value) => value === (authInfo.role as Role),
    )!;

    const { id: userId } = authInfo;

    const profile = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    const profileDto = new ProfileDto({ ...profile });

    if (role === Role.AGENT) {
      const profileDetail = await this.prisma.agentDetail.findUniqueOrThrow({
        where: { userId },
      });
      const profileDetailDto = new ProfileAgentDetailDto({ ...profileDetail });
      profileDto.agent = profileDetailDto;
    } else if (role === Role.MERCHANT) {
      const profileDetail = await this.prisma.merchantDetail.findUniqueOrThrow({
        where: { userId },
      });
      const profileDetailDto = new ProfileMerchantDetailDto({
        ...profileDetail,
      });
      profileDto.merchant = profileDetailDto;
    } else if (
      role === Role.ADMIN_AGENT ||
      role === Role.ADMIN_MERCHANT ||
      role === Role.ADMIN_ROLE_PERMISSION
    ) {
      const profileDetail = await this.prisma.adminDetail.findUniqueOrThrow({
        where: { userId },
      });
      const profileDetailDto = new ProfieAdminDetailDto({ ...profileDetail });
      profileDto.admin = profileDetailDto;
    }
    return profileDto;
  }

  async generatePrivateKey(authInfo: AuthInfoDto) {
    const { id: userId } = authInfo;
    const privateKey = CryptoHelper.generatePrivateKey();
    console.log(privateKey);
    const encryptedKey = CryptoHelper.encrypt(privateKey);
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

  async validateSignatureRequest(merchantId: number, signature: string) {
    const merchant = await this.prisma.merchantDetail.findFirst({
      where: { userId: merchantId },
    });
    if (!merchant) {
      throw new UnauthorizedException('Merchant Not Found');
    }
    const storedKey = CryptoHelper.decrypt(merchant.privateKey || '');
    if (storedKey !== signature) {
      throw new UnauthorizedException('error');
    }
    return true;
  }
}
