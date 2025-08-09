import { Injectable } from '@nestjs/common';
import { AuthInfoDto } from '../auth/dto/auth.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { AuthHelper } from 'src/shared/helper/auth.helper';
import { Role } from 'src/shared/constant/auth.constant';
import { CreateAgentDto } from './dto/create-agent.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findOneByEmailThrow(email: string) {
    return await this.prisma.user.findFirstOrThrow({
      where: { email },
      include: { role: true },
    });
  }

  async findOneByUsernameThrow(username: string) {
    return await this.prisma.user.findFirstOrThrow({
      where: { username },
    });
  }

  async findOneByAuthInfoThrow(authInfo: AuthInfoDto) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: authInfo.id },
      include: { role: true },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: { role: true },
    });
  }

  async registerMerchant(body: CreateMerchantDto) {
    return await this.prisma.$transaction(async (tx) => {
      const role = await tx.role.findFirstOrThrow({
        where: { name: Role.MERCHANT },
      });
      const { username, email, password } = body;
      const user = await tx.user.create({
        data: {
          roleId: role.id,
          username,
          email,
          password: await AuthHelper.hashPassword(password),
        },
      });
      const {
        businessName,
        npwp,
        address,
        bankName,
        accountNumber,
        accountHolderName,
      } = body;
      const merchant = await tx.merchantDetail.create({
        data: {
          userId: user.id,
          businessName,
          npwp,
          address,
          bankName,
          accountNumber,
          accountHolderName,
        },
      });

      console.log({ user, merchant });
    });
  }

  async registerAgent(body: CreateAgentDto) {
    return await this.prisma.$transaction(async (tx) => {
      const role = await tx.role.findFirstOrThrow({
        where: { name: Role.AGENT },
      });
      const { username, email, password } = body;
      const user = await tx.user.create({
        data: {
          roleId: role.id,
          username,
          email,
          password: await AuthHelper.hashPassword(password),
        },
      });
      const {
        fullname,
        address,
        phone,
        bankName,
        accountNumber,
        accountHolderName,
      } = body;
      const merchant = await tx.agentDetail.create({
        data: {
          userId: user.id,
          fullname,
          address,
          phone,
          bankName,
          accountNumber,
          accountHolderName,
        },
      });

      console.log({ user, merchant });
    });
  }
}
