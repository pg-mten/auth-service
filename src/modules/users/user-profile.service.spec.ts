import { Test, TestingModule } from '@nestjs/testing';
import { UserProfileService } from './user-profile.service';
import { PRISMA_SERVICE } from '../prisma/prisma.provider';
import { AuthInfoDto } from '../../microservice/auth/dto/auth-info.dto';
import { ROLE } from 'src/shared/constant/auth.constant';
import { TransactionUserRole } from 'src/shared/constant/transaction.constant';

describe('UserProfileService', () => {
  let service: UserProfileService;

  const mockPrismaClient = {
    user: {
      findUniqueOrThrow: jest.fn(),
    },
    adminDetail: {
      findFirstOrThrow: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
    agentDetail: {
      findFirstOrThrow: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
    merchantDetail: {
      findFirstOrThrow: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserProfileService,
        { provide: PRISMA_SERVICE, useValue: mockPrismaClient },
      ],
    }).compile();

    service = module.get<UserProfileService>(UserProfileService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findProfileIdByUserIdAndRole', () => {
    it('should return adminDetail.id for admin role', async () => {
      mockPrismaClient.adminDetail.findFirstOrThrow.mockResolvedValue({
        id: 100,
        userId: 1,
        fullname: 'Admin User',
        address: 'Admin St',
        phone: '081111',
      });

      const result = await service.findProfileIdByUserIdAndRole(
        1,
        'admin_super',
      );

      expect(
        mockPrismaClient.adminDetail.findFirstOrThrow,
      ).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(result).toBe(100);
    });

    it('should return agentDetail.id for agent role', async () => {
      mockPrismaClient.agentDetail.findFirstOrThrow.mockResolvedValue({
        id: 200,
        userId: 2,
        username: 'agent1',
        fullname: 'Agent User',
        address: 'Agent St',
        phone: '082222',
        bankCode: '001',
        bankName: 'Bank A',
        accountNumber: 'ACC-1',
        accountHolderName: 'Agent User',
      });

      const result = await service.findProfileIdByUserIdAndRole(2, 'agent');

      expect(
        mockPrismaClient.agentDetail.findFirstOrThrow,
      ).toHaveBeenCalledWith({ where: { userId: 2 } });
      expect(result).toBe(200);
    });

    it('should return merchantDetail.id for merchant role', async () => {
      mockPrismaClient.merchantDetail.findFirstOrThrow.mockResolvedValue({
        id: 300,
        userId: 3,
        ownerName: 'Owner',
        businessName: 'Biz',
        brandName: 'Brand',
        phoneNumber: '083333',
        nik: '32000',
        ktpImage: null,
        npwp: 'NP',
        address: 'Merch St',
        province: 'P',
        regency: 'R',
        district: 'D',
        village: 'V',
        postalCode: '10001',
        bankCode: '002',
        bankName: 'Bank B',
        accountNumber: 'ACC-2',
        accountHolderName: 'Owner',
        siupFile: null,
        coordinate: null,
      });

      const result = await service.findProfileIdByUserIdAndRole(3, 'merchant');

      expect(
        mockPrismaClient.merchantDetail.findFirstOrThrow,
      ).toHaveBeenCalledWith({ where: { userId: 3 } });
      expect(result).toBe(300);
    });

    it('should throw ResponseException for unknown role', async () => {
      await expect(
        service.findProfileIdByUserIdAndRole(1, 'unknown_role'),
      ).rejects.toThrow();
    });
  });

  describe('profile', () => {
    it('should return ProfileDto with agent detail for AGENT role', async () => {
      const authInfo = new AuthInfoDto({
        userId: 1,
        role: ROLE.AGENT,
        profileId: 200,
      });
      const user = {
        id: 1,
        email: 'agent@test.com',
        password: 'hashed',
        roleId: 5,
      };
      const agentDetail = {
        id: 200,
        userId: 1,
        username: 'agent1',
        fullname: 'Agent User',
        address: 'Agent St',
        phone: '082222',
        bankCode: '001',
        bankName: 'Bank A',
        accountNumber: 'ACC-1',
        accountHolderName: 'Agent User',
      };

      mockPrismaClient.user.findUniqueOrThrow.mockResolvedValue(user);
      mockPrismaClient.agentDetail.findUniqueOrThrow.mockResolvedValue(
        agentDetail,
      );

      const result = await service.profile(authInfo);

      expect(mockPrismaClient.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(
        mockPrismaClient.agentDetail.findUniqueOrThrow,
      ).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(result.userId).toBe(1);
      expect(result.profileId).toBe(200);
      expect(result.email).toBe('agent@test.com');
      expect(result.agent).toBeDefined();
      expect(result.agent!.fullname).toBe('Agent User');
      expect(result.agent!.address).toBe('Agent St');
      expect(result.agent!.phone).toBe('082222');
      expect(result.agent!.bankName).toBe('Bank A');
      expect(result.agent!.accountNumber).toBe('ACC-1');
      expect(result.agent!.accountHolderName).toBe('Agent User');
      expect(result.merchant).toBeUndefined();
      expect(result.admin).toBeUndefined();
    });

    it('should return ProfileDto with merchant detail for MERCHANT role', async () => {
      const authInfo = new AuthInfoDto({
        userId: 2,
        role: ROLE.MERCHANT,
        profileId: 300,
      });
      const user = {
        id: 2,
        email: 'merchant@test.com',
        password: 'hashed',
        roleId: 6,
      };
      const merchantDetail = {
        id: 300,
        userId: 2,
        ownerName: 'Owner',
        businessName: 'Biz Corp',
        brandName: 'Brand',
        phoneNumber: '083333',
        nik: '32000',
        ktpImage: 'ktp.jpg',
        npwp: 'NPWP-1',
        address: 'Merch St',
        province: 'Prov',
        regency: 'Reg',
        district: 'Dist',
        village: 'Vil',
        postalCode: '10001',
        bankCode: '002',
        bankName: 'Bank B',
        accountNumber: 'ACC-2',
        accountHolderName: 'Owner',
        siupFile: 'siup.pdf',
        coordinate: '-6.1,106.1',
      };

      mockPrismaClient.user.findUniqueOrThrow.mockResolvedValue(user);
      mockPrismaClient.merchantDetail.findUniqueOrThrow.mockResolvedValue(
        merchantDetail,
      );

      const result = await service.profile(authInfo);

      expect(result.userId).toBe(2);
      expect(result.profileId).toBe(300);
      expect(result.email).toBe('merchant@test.com');
      expect(result.merchant).toBeDefined();
      expect(result.merchant!.businessName).toBe('Biz Corp');
      expect(result.merchant!.npwp).toBe('NPWP-1');
      expect(result.merchant!.address).toBe('Merch St');
      expect(result.merchant!.bankName).toBe('Bank B');
      expect(result.merchant!.accountNumber).toBe('ACC-2');
      expect(result.merchant!.accountHolderName).toBe('Owner');
      expect(result.agent).toBeUndefined();
      expect(result.admin).toBeUndefined();
    });

    it('should return ProfileDto with admin detail for admin role', async () => {
      const authInfo = new AuthInfoDto({
        userId: 3,
        role: ROLE.ADMIN_SUPER,
        profileId: 400,
      });
      const user = {
        id: 3,
        email: 'admin@test.com',
        password: 'hashed',
        roleId: 7,
      };
      const adminDetail = {
        id: 400,
        userId: 3,
        fullname: 'Admin User',
        address: 'Admin St',
        phone: '081111',
      };

      mockPrismaClient.user.findUniqueOrThrow.mockResolvedValue(user);
      mockPrismaClient.adminDetail.findUniqueOrThrow.mockResolvedValue(
        adminDetail,
      );

      const result = await service.profile(authInfo);

      expect(result.userId).toBe(3);
      expect(result.profileId).toBe(400);
      expect(result.email).toBe('admin@test.com');
      expect(result.admin).toBeDefined();
      expect(result.admin!.fullname).toBe('Admin User');
      expect(result.admin!.address).toBe('Admin St');
      expect(result.admin!.phone).toBe('081111');
      expect(result.agent).toBeUndefined();
      expect(result.merchant).toBeUndefined();
    });
  });

  describe('findProfileBank', () => {
    it('should return agent bank profile', async () => {
      const dto = { userId: 1 };
      mockPrismaClient.user.findUniqueOrThrow.mockResolvedValue({
        role: { name: 'AGENT' },
      });
      mockPrismaClient.agentDetail.findUniqueOrThrow.mockResolvedValue({
        id: 200,
        userId: 1,
        bankCode: '001',
        bankName: 'Bank A',
        accountNumber: 'ACC-1',
        accountHolderName: 'Agent User',
      });

      const result = await service.findProfileBank(dto);

      expect(mockPrismaClient.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 1 },
        select: { role: true },
      });
      expect(result.userId).toBe(1);
      expect(result.profileId).toBe(200);
      expect(result.userRole).toBe(TransactionUserRole.AGENT);
      expect(result.bankCode).toBe('001');
      expect(result.bankName).toBe('Bank A');
      expect(result.accountNumber).toBe('ACC-1');
      expect(result.accountHolderName).toBe('Agent User');
    });

    it('should return merchant bank profile', async () => {
      const dto = { userId: 2 };
      mockPrismaClient.user.findUniqueOrThrow.mockResolvedValue({
        role: { name: 'MERCHANT' },
      });
      mockPrismaClient.merchantDetail.findUniqueOrThrow.mockResolvedValue({
        id: 300,
        userId: 2,
        bankCode: '002',
        bankName: 'Bank B',
        accountNumber: 'ACC-2',
        accountHolderName: 'Owner',
      });

      const result = await service.findProfileBank(dto);

      expect(result.userId).toBe(2);
      expect(result.profileId).toBe(300);
      expect(result.userRole).toBe(TransactionUserRole.MERCHANT);
      expect(result.bankCode).toBe('002');
      expect(result.bankName).toBe('Bank B');
      expect(result.accountNumber).toBe('ACC-2');
      expect(result.accountHolderName).toBe('Owner');
    });

    it('should return admin bank profile (TODO: currently empty)', async () => {
      const dto = { userId: 3 };
      mockPrismaClient.user.findUniqueOrThrow.mockResolvedValue({
        role: { name: 'ADMIN_SUPER' },
      });
      mockPrismaClient.adminDetail.findUniqueOrThrow.mockResolvedValue({
        id: 400,
        userId: 3,
        fullname: 'Admin User',
      });

      const result = await service.findProfileBank(dto);

      expect(result.userId).toBe(3);
      expect(result.profileId).toBe(400);
      expect(result.userRole).toBe(TransactionUserRole.ADMIN);
      expect(result.bankCode).toBe('');
      expect(result.bankName).toBe('');
      expect(result.accountNumber).toBe('');
      expect(result.accountHolderName).toBe('');
    });
  });
});
