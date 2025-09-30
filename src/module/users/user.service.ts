import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMerchantDto } from '../merchant-detail/dto/create-merchant.dto';
import { AuthHelper } from 'src/shared/helper/auth.helper';
import { ROLE } from 'src/shared/constant/auth.constant';
import { CreateAgentDto } from '../agent-detail/dto/create-agent.dto';
import { MerchantDetailService } from '../merchant-detail/merchant-detail.service';
import { AgentDetailService } from '../agent-detail/agent-detail.service';
import { AgentConfigClient } from 'src/microservice/config/agent.config.client';
import { MerchantConfigClient } from 'src/microservice/config/merchant.config.client';
import { MerchantSystemDto } from 'src/microservice/auth/dto-system/merchant.system.dto';
import { AgentSystemDto } from 'src/microservice/auth/dto-system/agent.system.dto';
import { FilterMerchantsAndAgentsByIdsSystemDto } from 'src/microservice/auth/dto-system/filter-merchants-and-agents-by-ids.system.dto';
import { MerchantsAndAgentsByIdsSystemDto } from 'src/microservice/auth/dto-system/merchants-and-agents-by-ids.system.dto';
import { AuthInfoDto } from '../../microservice/auth/dto/auth-info.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly merchantService: MerchantDetailService,
    private readonly agentService: AgentDetailService,
    private readonly agentConfigClient: AgentConfigClient,
    private readonly merchantConfigClient: MerchantConfigClient,
  ) {}

  async findOneByEmailThrow(email: string) {
    return await this.prisma.user.findFirstOrThrow({
      where: { email },
      include: { role: true },
    });
  }

  async findOneByAuthInfoThrow(authInfo: AuthInfoDto) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: authInfo.userId },
      include: { role: true },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: { role: true },
    });
  }

  async findAllMerchantsAndAgentsByIds(
    filter: FilterMerchantsAndAgentsByIdsSystemDto,
  ): Promise<MerchantsAndAgentsByIdsSystemDto> {
    const { agentIds, merchantIds } = filter;
    const merchantIdList = merchantIds?.split(',').map(Number) ?? [];
    const agentIdList = agentIds?.split(',').map(Number) ?? [];
    const [merchants, agents] = await Promise.all([
      this.merchantService.findIds(merchantIdList),
      this.agentService.findIds(agentIdList),
    ]);
    return new MerchantsAndAgentsByIdsSystemDto({
      merchants: merchants.map(
        (merchant) => new MerchantSystemDto({ ...merchant }),
      ),
      agents: agents.map((agent) => new AgentSystemDto({ ...agent })),
    });
  }

  async registerMerchant(body: CreateMerchantDto) {
    return await this.prisma.$transaction(async (tx) => {
      const role = await tx.role.findFirstOrThrow({
        where: { name: ROLE.MERCHANT },
      });
      const user = await tx.user.create({
        data: {
          roleId: role.id,
          email: body.email,
          password: await AuthHelper.hashPassword(body.password),
        },
      });

      const merchant = await tx.merchantDetail.create({
        data: {
          userId: user.id,
          ...body,
        },
      });

      console.log({ user, merchant });
      const { settlementInterval } = body;
      try {
        const res = await this.merchantConfigClient.createTCP({
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
        where: { name: ROLE.AGENT },
      });
      const { email, password } = body;
      const user = await tx.user.create({
        data: {
          roleId: role.id,
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
        const res = await this.agentConfigClient.createTCP({ id: agent.id });
        console.log(res.data);
      } catch (error) {
        console.log(error);
        throw error;
      }
    });
  }
}
