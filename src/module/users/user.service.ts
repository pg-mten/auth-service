import { Injectable } from '@nestjs/common';
import { AuthInfoDto } from '../auth/dto/auth.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { AuthHelper } from 'src/shared/helper/auth.helper';
import { Role } from 'src/shared/constant/auth.constant';
import { CreateAgentDto } from './dto/create-agent.dto';
import { MerchantDetailService } from '../merchant-detail/merchant-detail.service';
import { AgentDetailService } from '../agent-detail/agent-detail.service';
import { MerchantDto } from '../merchant-detail/dto/merchant.dto';
import { AgentDto } from '../agent-detail/dto/agent.dto';
import axios from 'axios';
import { URL_CONFIG } from 'src/shared/constant/url.constant';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly merchantService: MerchantDetailService,
    private readonly agentService: AgentDetailService,
  ) {}

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

  async internalfindAllMerchantsAndAgentsByIds(
    merchantIdList: number[],
    agentIdList: number[],
  ): Promise<{ merchants: MerchantDto[]; agents: AgentDto[] }> {
    const [merchants, agents] = await Promise.all([
      this.merchantService.findIds(merchantIdList),
      this.agentService.findIds(agentIdList),
    ]);
    return {
      merchants,
      agents,
    };
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
      const { settlementInterval } = body;
      try {
        const res = await axios.post(`${URL_CONFIG}/merchant/internal`, {
          id: merchant.id,
          settlementInterval: settlementInterval,
        });
        console.log(res.data);
      } catch (error) {
        console.log(error);
        throw error;
      }
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
      const agent = await tx.agentDetail.create({
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

      console.log({ user, agent });

      try {
        const res = await axios.post(`${URL_CONFIG}/agent`, {
          id: agent.id,
        });
        console.log(res.data);
      } catch (error) {
        console.log(error);
        throw error;
      }
    });
  }
}
