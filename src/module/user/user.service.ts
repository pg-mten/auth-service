import { Inject, Injectable } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from '../prisma/prisma.extension';
import { User } from '@prisma/client';
import { AuthInfoDto } from '../auth/dto/auth.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject('PrismaService')
    private readonly prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  async findOneByEmailThrow(email: string) {
    return this.prisma.client.user.findUniqueOrThrow({
      where: { email },
      include: { role: true },
    });
  }

  async findOneByAuthInfoThrow(authInfo: AuthInfoDto) {
    return this.prisma.client.user.findUniqueOrThrow({
      where: { email: authInfo.email },
      include: { role: true },
    });
  }

  async findOneByAuthInfoThrow(authInfo: AuthInfoDto) {
    return this.prisma.client.user.findUniqueOrThrow({
      where: { email: authInfo.email },
      include: { role: true },
    });
  }
}
