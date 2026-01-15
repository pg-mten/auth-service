import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ROLE } from 'src/microservice/auth.constant';
import { ProfileDto } from './dto/profile.dto';
import { ProfileMerchantDetailDto } from './dto/profile-merchant.dto';
import { ProfileAgentDetailDto } from './dto/profile-agent.dto';
import { ProfieAdminDetailDto } from './dto/profile-admin.dto';
import { AuthInfoDto } from '../../microservice/auth/dto/auth-info.dto';
import { ResponseException } from 'src/exception/response.exception';
import { PRISMA_SERVICE } from '../prisma/prisma.provider';
import { FilterProfileBankSystemDto } from 'src/microservice/auth/dto-system/filter-profile-bank.system.dto';
import { ProfileBankByIdSystemDto } from 'src/microservice/auth/dto-system/profile-bank.system.dto';
import { TransactionUserRole } from 'src/microservice/transaction.constant';

@Injectable()
export class UserProfileService {
  constructor(@Inject(PRISMA_SERVICE) private readonly prisma: PrismaClient) {}

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

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    // const profileDto = new ProfileDto({ ...profile });

    if (role === ROLE.AGENT) {
      const profileDetail = await this.prisma.agentDetail.findUniqueOrThrow({
        where: { userId },
      });
      return new ProfileDto({
        userId: user.id,
        profileId: profileDetail.id,
        email: user.email,
        agent: new ProfileAgentDetailDto({ ...profileDetail }),
      });
    } else if (role === ROLE.MERCHANT) {
      const profileDetail = await this.prisma.merchantDetail.findUniqueOrThrow({
        where: { userId },
      });
      return new ProfileDto({
        userId: user.id,
        profileId: profileDetail.id,
        email: user.email,
        merchant: new ProfileMerchantDetailDto({
          ...profileDetail,
        }),
      });
    }
    // else if (
    //   role === ROLE.ADMIN_AGENT ||
    //   role === ROLE.ADMIN_MERCHANT ||
    //   role === ROLE.ADMIN_ROLE_PERMISSION
    // ) {
    // }
    const profileDetail = await this.prisma.adminDetail.findUniqueOrThrow({
      where: { userId },
    });
    return new ProfileDto({
      userId: user.id,
      profileId: profileDetail.id,
      email: user.email,
      admin: new ProfieAdminDetailDto({ ...profileDetail }),
    });
  }

  async findProfileBank(dto: FilterProfileBankSystemDto) {
    const { userId } = dto;
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { role: true },
    });
    const role = user.role.name;

    if (role.toLowerCase().includes('agent')) {
      const agent = await this.prisma.agentDetail.findUniqueOrThrow({
        where: { userId: userId },
      });
      return new ProfileBankByIdSystemDto({
        userId: userId,
        profileId: agent.id,
        userRole: TransactionUserRole.AGENT,
        bankCode: agent.bankCode,
        bankName: agent.bankName,
        accountNumber: agent.accountNumber,
        accountHolderName: agent.accountHolderName,
      });
    } else if (role.toLowerCase().includes('merchant')) {
      const merchant = await this.prisma.merchantDetail.findUniqueOrThrow({
        where: { userId: userId },
      });
      return new ProfileBankByIdSystemDto({
        userId: userId,
        profileId: merchant.id,
        userRole: TransactionUserRole.MERCHANT,
        bankCode: merchant.bankCode,
        bankName: merchant.bankName,
        accountNumber: merchant.accountNumber,
        accountHolderName: merchant.accountHolderName,
      });
    }

    const admin = await this.prisma.adminDetail.findUniqueOrThrow({
      where: { userId: userId },
    });

    // TODO Tanya ke manager, apa nomor rekeningnya
    return new ProfileBankByIdSystemDto({
      userId: userId,
      profileId: admin.id,
      userRole: TransactionUserRole.ADMIN,
      bankCode: '',
      bankName: '',
      accountNumber: '',
      accountHolderName: '',
    });
  }
}
