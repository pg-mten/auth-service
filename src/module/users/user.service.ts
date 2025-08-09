import { Injectable } from '@nestjs/common';
import { AuthInfoDto } from '../auth/dto/auth.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from 'src/shared/constant/auth.constant';
import { ProfileDto } from './dto/profile.dto';
import { ProfileMerchantDetailDto } from './dto/profile-merchant.dto';
import { ProfileAgentDetailDto } from './dto/profile-agent.dto';
import { ProfieAdminDetailDto } from './dto/profile-admin.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findOneByEmailThrow(email: string) {
    return await this.prisma.user.findFirst({
      where: { email },
      include: { role: true },
    });
  }

  async findOneByAuthInfoThrow(authInfo: AuthInfoDto) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: authInfo.id },
      include: { role: true },
    });
  }

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
}
