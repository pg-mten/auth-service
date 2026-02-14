import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { MerchantDetailService } from '../merchant-detail/merchant-detail.service';
import { AgentDetailService } from '../agent-detail/agent-detail.service';
import { AgentConfigClient } from 'src/microservice/config/agent.config.client';
import { MerchantConfigClient } from 'src/microservice/config/merchant.config.client';
import { AuthHelper } from 'src/shared/helper/auth.helper';
import { PRISMA_SERVICE } from '../prisma/prisma.provider';
import { CreateMerchantDto } from '../merchant-detail/dto/create-merchant.dto';
import { CreateAgentDto } from '../agent-detail/dto/create-agent.dto';
import { AuthInfoDto } from '../../microservice/auth/dto/auth-info.dto';
import { ROLE } from 'src/shared/constant/auth.constant';
import { CryptoHelper } from 'src/shared/helper';
import { FilterMerchantsAndAgentsByIdsSystemDto } from 'src/microservice/auth/dto-system/filter-merchants-and-agents-by-ids.system.dto';

describe('UserService', () => {
  let service: UserService;

  // Mock Prisma Client with transaction support
  const mockPrismaClient = {
    user: {
      findFirstOrThrow: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    role: {
      findFirstOrThrow: jest.fn(),
    },
    merchantDetail: {
      create: jest.fn(),
    },
    merchantSignature: {
      create: jest.fn(),
    },
    agentDetail: {
      create: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation((cb) => cb(mockPrismaClient)),
  };

  const mockMerchantService = {
    findIds: jest.fn(),
  };

  const mockAgentService = {
    findIds: jest.fn(),
  };

  const mockAgentConfigClient = {
    createTCP: jest.fn(),
  };

  const mockMerchantConfigClient = {
    createTCP: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PRISMA_SERVICE, useValue: mockPrismaClient },
        { provide: MerchantDetailService, useValue: mockMerchantService },
        { provide: AgentDetailService, useValue: mockAgentService },
        { provide: AgentConfigClient, useValue: mockAgentConfigClient },
        { provide: MerchantConfigClient, useValue: mockMerchantConfigClient },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ────────────────────────────────────────────────────────────────────────
  // Method order matches service file:
  //   findOneByEmailThrow → findOneByAuthInfoThrow → findAll
  //   → findAllMerchantsAndAgentsByIds → registerMerchant → registerAgent
  // ────────────────────────────────────────────────────────────────────────

  describe('findOneByEmailThrow', () => {
    it('should return user if found', async () => {
      const user = {
        id: 1,
        email: 'test@test.com',
        password: 'hashed',
        roleId: 1,
        role: { id: 1, name: 'merchant' },
      };
      mockPrismaClient.user.findFirstOrThrow.mockResolvedValue(user);

      const result = await service.findOneByEmailThrow('test@test.com');

      expect(result).toEqual(user);
      expect(result.id).toBe(1);
      expect(result.email).toBe('test@test.com');
      expect(result.role.name).toBe('merchant');
      expect(mockPrismaClient.user.findFirstOrThrow).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
        include: { role: true },
      });
    });

    it('should throw if user not found', async () => {
      mockPrismaClient.user.findFirstOrThrow.mockRejectedValue(
        new Error('Not found'),
      );

      await expect(
        service.findOneByEmailThrow('nonexistent@test.com'),
      ).rejects.toThrow('Not found');
    });
  });

  describe('findOneByAuthInfoThrow', () => {
    it('should return user by auth info', async () => {
      const authInfo = new AuthInfoDto({
        userId: 1,
        role: 'merchant',
        profileId: 1,
      });
      const user = {
        id: 1,
        email: 'test@test.com',
        password: 'hashed',
        roleId: 1,
        role: { id: 1, name: 'merchant' },
      };
      mockPrismaClient.user.findUniqueOrThrow.mockResolvedValue(user);

      const result = await service.findOneByAuthInfoThrow(authInfo);

      expect(result).toEqual(user);
      expect(result.id).toBe(1);
      expect(result.email).toBe('test@test.com');
      expect(mockPrismaClient.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { role: true },
      });
    });

    it('should throw if user not found', async () => {
      const authInfo = new AuthInfoDto({
        userId: 999,
        role: 'merchant',
        profileId: 1,
      });
      mockPrismaClient.user.findUniqueOrThrow.mockRejectedValue(
        new Error('Not found'),
      );

      await expect(service.findOneByAuthInfoThrow(authInfo)).rejects.toThrow(
        'Not found',
      );
    });
  });

  describe('findAll', () => {
    it('should return array of users', async () => {
      const users = [
        {
          id: 1,
          email: 'user1@test.com',
          password: 'h1',
          roleId: 1,
          role: { id: 1, name: 'merchant' },
        },
        {
          id: 2,
          email: 'user2@test.com',
          password: 'h2',
          roleId: 2,
          role: { id: 2, name: 'agent' },
        },
        {
          id: 3,
          email: 'user3@test.com',
          password: 'h3',
          roleId: 3,
          role: { id: 3, name: 'admin' },
        },
      ];
      mockPrismaClient.user.findMany.mockResolvedValue(users);

      const result = await service.findAll();

      expect(mockPrismaClient.user.findMany).toHaveBeenCalledWith({
        include: { role: true },
      });
      expect(result).toHaveLength(3);
      expect(result[0].email).toBe('user1@test.com');
      expect(result[0].role.name).toBe('merchant');
      expect(result[1].email).toBe('user2@test.com');
      expect(result[1].role.name).toBe('agent');
      expect(result[2].email).toBe('user3@test.com');
      expect(result[2].role.name).toBe('admin');
    });
  });

  describe('findAllMerchantsAndAgentsByIds', () => {
    it('should return merchants and agents by ids', async () => {
      const filter = new FilterMerchantsAndAgentsByIdsSystemDto();
      filter.merchantIds = '1,2,3';
      filter.agentIds = '4,5,6';

      const merchants = [
        {
          merchantId: 1,
          userId: 10,
          email: 'm1@test.com',
          businessName: 'Merchant One',
        },
        {
          merchantId: 2,
          userId: 20,
          email: 'm2@test.com',
          businessName: 'Merchant Two',
        },
        {
          merchantId: 3,
          userId: 30,
          email: 'm3@test.com',
          businessName: 'Merchant Three',
        },
      ];
      const agents = [
        { agentId: 4, userId: 40, email: 'a1@test.com', fullname: 'Agent One' },
        { agentId: 5, userId: 50, email: 'a2@test.com', fullname: 'Agent Two' },
        {
          agentId: 6,
          userId: 60,
          email: 'a3@test.com',
          fullname: 'Agent Three',
        },
      ];

      mockMerchantService.findIds.mockResolvedValue(merchants);
      mockAgentService.findIds.mockResolvedValue(agents);

      const result = await service.findAllMerchantsAndAgentsByIds(filter);

      expect(mockMerchantService.findIds).toHaveBeenCalledWith([1, 2, 3]);
      expect(mockAgentService.findIds).toHaveBeenCalledWith([4, 5, 6]);
      expect(result).toBeDefined();
      expect(result.merchants).toHaveLength(3);
      expect(result.agents).toHaveLength(3);
      expect(result.merchants[0].merchantId).toBe(1);
      expect(result.agents[0].agentId).toBe(4);
    });

    it('should handle null merchantIds and agentIds', async () => {
      const filter = new FilterMerchantsAndAgentsByIdsSystemDto();
      filter.merchantIds = null;
      filter.agentIds = null;

      mockMerchantService.findIds.mockResolvedValue([]);
      mockAgentService.findIds.mockResolvedValue([]);

      const result = await service.findAllMerchantsAndAgentsByIds(filter);

      expect(mockMerchantService.findIds).toHaveBeenCalledWith([]);
      expect(mockAgentService.findIds).toHaveBeenCalledWith([]);
      expect(result).toBeDefined();
      expect(result.merchants).toHaveLength(0);
      expect(result.agents).toHaveLength(0);
    });
  });

  describe('registerMerchant', () => {
    const makeCreateMerchantDto = (): CreateMerchantDto => {
      const dto = new CreateMerchantDto();
      dto.email = 'merchant@test.com';
      dto.password = 'password';
      dto.ownerName = 'Owner Test';
      dto.businessName = 'Business Test';
      dto.brandName = 'Brand Test';
      dto.phoneNumber = '08210000001';
      dto.nik = '3200000000001';
      dto.ktpImage = 'ktp_test.jpg';
      dto.npwp = 'NPWP-TEST';
      dto.address = '100 Commerce St';
      dto.province = 'Province Test';
      dto.regency = 'Regency Test';
      dto.district = 'District Test';
      dto.village = 'Village Test';
      dto.postalCode = '10001';
      dto.bankCode = '001';
      dto.bankName = 'Bank Test';
      dto.accountNumber = 'ACC-TEST';
      dto.accountHolderName = 'Holder Test';
      dto.siupFile = 'siup_test.pdf';
      dto.settlementInterval = 1;
      dto.coordinate = '-6.1,106.1';
      return dto;
    };

    it('should register a merchant successfully', async () => {
      const authInfo = new AuthInfoDto({
        userId: 99,
        role: 'admin',
        profileId: 1,
      });
      const createMerchantDto = makeCreateMerchantDto();

      const role = { id: 10, name: ROLE.MERCHANT };
      const user = { id: 1, email: 'merchant@test.com' };

      mockPrismaClient.role.findFirstOrThrow.mockResolvedValue(role);
      jest
        .spyOn(AuthHelper, 'hashPassword')
        .mockResolvedValue('hashed_password');
      mockPrismaClient.user.create.mockResolvedValue(user);
      mockPrismaClient.merchantDetail.create.mockResolvedValue({});
      jest.spyOn(CryptoHelper, 'generateClientId').mockReturnValue('client_id');
      mockPrismaClient.merchantSignature.create.mockResolvedValue({});
      mockMerchantConfigClient.createTCP.mockResolvedValue({ data: 'success' });

      await service.registerMerchant(authInfo, createMerchantDto);

      expect(mockPrismaClient.$transaction).toHaveBeenCalled();
      expect(mockPrismaClient.role.findFirstOrThrow).toHaveBeenCalledWith({
        where: { name: ROLE.MERCHANT },
      });
      expect(mockPrismaClient.user.create).toHaveBeenCalled();
      expect(mockPrismaClient.merchantDetail.create).toHaveBeenCalled();
      expect(mockPrismaClient.merchantSignature.create).toHaveBeenCalled();
      expect(mockMerchantConfigClient.createTCP).toHaveBeenCalledWith({
        id: user.id,
        agentId: authInfo.userId,
        settlementInterval: 1,
      });
    });

    it('should throw if merchantConfigClient.createTCP fails', async () => {
      const authInfo = new AuthInfoDto({
        userId: 99,
        role: 'admin',
        profileId: 1,
      });
      const createMerchantDto = makeCreateMerchantDto();

      mockPrismaClient.role.findFirstOrThrow.mockResolvedValue({
        id: 10,
        name: ROLE.MERCHANT,
      });
      jest
        .spyOn(AuthHelper, 'hashPassword')
        .mockResolvedValue('hashed_password');
      mockPrismaClient.user.create.mockResolvedValue({ id: 1 });
      mockPrismaClient.merchantDetail.create.mockResolvedValue({});
      jest.spyOn(CryptoHelper, 'generateClientId').mockReturnValue('client_id');
      mockPrismaClient.merchantSignature.create.mockResolvedValue({});
      mockMerchantConfigClient.createTCP.mockRejectedValue(
        new Error('Config service error'),
      );

      await expect(
        service.registerMerchant(authInfo, createMerchantDto),
      ).rejects.toThrow('Config service error');
    });
  });

  describe('registerAgent', () => {
    const makeCreateAgentDto = (): CreateAgentDto => {
      const dto = new CreateAgentDto();
      dto.email = 'agent@test.com';
      dto.password = 'password';
      dto.username = 'agent1';
      dto.fullname = 'Agent One';
      dto.address = '123 Street';
      dto.phone = '08123456789';
      dto.bankCode = '014';
      dto.bankName = 'Bank ABC';
      dto.accountNumber = '123456';
      dto.accountHolderName = 'Agent One';
      return dto;
    };

    it('should register an agent successfully', async () => {
      const createAgentDto = makeCreateAgentDto();

      const role = { id: 20, name: ROLE.AGENT };
      const user = { id: 2, email: 'agent@test.com' };

      mockPrismaClient.role.findFirstOrThrow.mockResolvedValue(role);
      jest
        .spyOn(AuthHelper, 'hashPassword')
        .mockResolvedValue('hashed_password');
      mockPrismaClient.user.create.mockResolvedValue(user);
      mockPrismaClient.agentDetail.create.mockResolvedValue({});
      mockAgentConfigClient.createTCP.mockResolvedValue({ data: 'success' });

      await service.registerAgent(createAgentDto);

      expect(mockPrismaClient.$transaction).toHaveBeenCalled();
      expect(mockPrismaClient.role.findFirstOrThrow).toHaveBeenCalledWith({
        where: { name: ROLE.AGENT },
      });
      expect(mockPrismaClient.user.create).toHaveBeenCalledWith({
        data: {
          roleId: role.id,
          email: 'agent@test.com',
          password: 'hashed_password',
        },
      });
      expect(mockPrismaClient.agentDetail.create).toHaveBeenCalledWith({
        data: {
          userId: user.id,
          username: 'agent1',
          fullname: 'Agent One',
          address: '123 Street',
          phone: '08123456789',
          bankCode: '014',
          bankName: 'Bank ABC',
          accountNumber: '123456',
          accountHolderName: 'Agent One',
        },
      });
      expect(mockAgentConfigClient.createTCP).toHaveBeenCalledWith({
        id: user.id,
      });
    });

    it('should throw if agentConfigClient.createTCP fails', async () => {
      const createAgentDto = makeCreateAgentDto();

      mockPrismaClient.role.findFirstOrThrow.mockResolvedValue({
        id: 20,
        name: ROLE.AGENT,
      });
      jest
        .spyOn(AuthHelper, 'hashPassword')
        .mockResolvedValue('hashed_password');
      mockPrismaClient.user.create.mockResolvedValue({ id: 2 });
      mockPrismaClient.agentDetail.create.mockResolvedValue({});
      mockAgentConfigClient.createTCP.mockRejectedValue(
        new Error('Config service error'),
      );

      await expect(service.registerAgent(createAgentDto)).rejects.toThrow(
        'Config service error',
      );
    });
  });
});
