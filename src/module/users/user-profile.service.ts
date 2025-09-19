import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ROLE } from 'src/shared/constant/auth.constant';
import { ProfileDto } from './dto/profile.dto';
import { ProfileMerchantDetailDto } from './dto/profile-merchant.dto';
import { ProfileAgentDetailDto } from './dto/profile-agent.dto';
import { ProfieAdminDetailDto } from './dto/profile-admin.dto';
import { CryptoHelper } from 'src/shared/helper/crypto.helper';
import { DateHelper } from 'src/shared/helper/date.helper';
import { AuthInfoDto } from '../../microservice/auth/dto/auth-info.dto';
import { ResponseException } from 'src/exception/response.exception';

@Injectable()
export class UserProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async findProfileIdByUserIdAndRole(userId: number, role: string) {
    // const role: ROLE = Object.values(ROLE).find(
    //   (value) => value === (roleStr as ROLE),
    // )!;

    // TODO Semua ROLE belum ke declare semua berdasarkan bisnis process
    if (role.toLowerCase().includes('admin')) {
      const admin = await this.prisma.adminDetail.findFirstOrThrow({
        where: { userId },
      });
      return admin.id;
    } else if (role.toLowerCase().includes('agent')) {
      const agent = await this.prisma.agentDetail.findFirstOrThrow({
        where: { userId },
      });
      return agent.id;
    } else if (role.toLowerCase().includes('merchant')) {
      const merchant = await this.prisma.merchantDetail.findFirstOrThrow({
        where: { userId },
      });
      return merchant.id;
    }
    throw ResponseException.fromHttpExecption(new UnauthorizedException());
  }

  async profile(authInfo: AuthInfoDto) {
    console.log({ authInfo });

    const { userId, role: roleAuthInfo } = authInfo;

    const role: ROLE = Object.values(ROLE).find(
      (value) => value === (roleAuthInfo as ROLE),
    )!;

    const profile = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    const profileDto = new ProfileDto({ ...profile });

    if (role === ROLE.AGENT) {
      const profileDetail = await this.prisma.agentDetail.findUniqueOrThrow({
        where: { userId },
      });
      const profileDetailDto = new ProfileAgentDetailDto({ ...profileDetail });
      profileDto.agent = profileDetailDto;
    } else if (role === ROLE.MERCHANT) {
      const profileDetail = await this.prisma.merchantDetail.findUniqueOrThrow({
        where: { userId },
      });
      const profileDetailDto = new ProfileMerchantDetailDto({
        ...profileDetail,
      });
      profileDto.merchant = profileDetailDto;
    } else if (
      role === ROLE.ADMIN_AGENT ||
      role === ROLE.ADMIN_MERCHANT ||
      role === ROLE.ADMIN_ROLE_PERMISSION
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
    const { userId } = authInfo;
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
