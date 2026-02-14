import { Test, TestingModule } from '@nestjs/testing';
import { MerchantSignatureService } from './merchant-signature.service';
import { PRISMA_SERVICE } from '../prisma/prisma.provider';
import { CryptoHelper } from 'src/shared/helper/crypto.helper';

describe('MerchantSignatureService', () => {
  let service: MerchantSignatureService;

  const mockPrismaClient = {
    merchantSignature: {
      findFirstOrThrow: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MerchantSignatureService,
        { provide: PRISMA_SERVICE, useValue: mockPrismaClient },
      ],
    }).compile();

    service = module.get<MerchantSignatureService>(MerchantSignatureService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findMerchantUrl', () => {
    it('should return payin and payout urls when both are set', async () => {
      const dto = { userId: 1 };
      const merchantUrl = {
        payinUrl: 'http://payin.com',
        payoutUrl: 'http://payout.com',
      };
      mockPrismaClient.merchantSignature.findFirstOrThrow.mockResolvedValue(
        merchantUrl,
      );

      const result = await service.findMerchantUrl(dto);

      expect(
        mockPrismaClient.merchantSignature.findFirstOrThrow,
      ).toHaveBeenCalledWith({
        where: { userId: 1 },
        select: { payinUrl: true, payoutUrl: true },
      });
      expect(result.payinUrl).toBe('http://payin.com');
      expect(result.payoutUrl).toBe('http://payout.com');
    });

    it('should return null urls when both are null', async () => {
      const dto = { userId: 2 };
      const merchantUrl = { payinUrl: null, payoutUrl: null };
      mockPrismaClient.merchantSignature.findFirstOrThrow.mockResolvedValue(
        merchantUrl,
      );

      const result = await service.findMerchantUrl(dto);

      expect(result.payinUrl).toBeNull();
      expect(result.payoutUrl).toBeNull();
    });

    it('should throw if merchant signature not found', async () => {
      const dto = { userId: 999 };
      mockPrismaClient.merchantSignature.findFirstOrThrow.mockRejectedValue(
        new Error('Not found'),
      );

      await expect(service.findMerchantUrl(dto)).rejects.toThrow('Not found');
    });
  });

  describe('generateSecretKey', () => {
    it('should generate and update secret key', async () => {
      const authInfo = { userId: 1 };
      const merchantSignature = { secretKey: 'oldSecret' };
      const newSecret = 'newSecret';

      mockPrismaClient.merchantSignature.findUniqueOrThrow.mockResolvedValue(
        merchantSignature,
      );
      jest
        .spyOn(CryptoHelper, 'generatedSharedSecretKey')
        .mockReturnValue(newSecret);
      mockPrismaClient.merchantSignature.update.mockResolvedValue({});

      const result = await service.generateSecretKey(authInfo as any);

      expect(
        mockPrismaClient.merchantSignature.findUniqueOrThrow,
      ).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
      expect(mockPrismaClient.merchantSignature.update).toHaveBeenCalledWith({
        where: { userId: 1 },
        data: { secretKey: newSecret, previousSecretKey: 'oldSecret' },
      });
      expect(result).toBe(newSecret);
    });

    it('should handle null previous secret key', async () => {
      const authInfo = { userId: 1 };
      const merchantSignature = { secretKey: null };
      const newSecret = 'newSecret';

      mockPrismaClient.merchantSignature.findUniqueOrThrow.mockResolvedValue(
        merchantSignature,
      );
      jest
        .spyOn(CryptoHelper, 'generatedSharedSecretKey')
        .mockReturnValue(newSecret);
      mockPrismaClient.merchantSignature.update.mockResolvedValue({});

      const result = await service.generateSecretKey(authInfo as any);

      expect(mockPrismaClient.merchantSignature.update).toHaveBeenCalledWith({
        where: { userId: 1 },
        data: { secretKey: newSecret, previousSecretKey: null },
      });
      expect(result).toBe(newSecret);
    });
  });

  describe('validateSignature', () => {
    const baseHeaders = {
      xClientId: 'client123',
      xTimestamp: new Date().toISOString(),
      xNonce: 'nonce123',
      xSignature: 'sig123',
      xSignAlg: 'HMAC-SHA256',
    };

    const baseDto = {
      headers: baseHeaders,
      method: 'POST' as any,
      path: '/api/test',
      body: { key: 'value' },
    };

    it('should return isValid false when merchant has no secret key', async () => {
      mockPrismaClient.merchantSignature.findUnique.mockResolvedValue({
        userId: 1,
        secretKey: null,
        clientId: 'client123',
        status: 'ACTIVE',
        previousSecretKey: null,
        payinUrl: null,
        payoutUrl: null,
      });

      const result = await service.validateSignature(baseDto);

      expect(result.isValid).toBe(false);
      expect(result.userId).toBe(1);
      expect(result.message).toBe('Merchant Secret Key not found');
    });

    it('should return isValid false with userId 0 when merchant is not found', async () => {
      mockPrismaClient.merchantSignature.findUnique.mockResolvedValue(null);

      const result = await service.validateSignature(baseDto);

      expect(result.isValid).toBe(false);
      expect(result.userId).toBe(0);
      expect(result.message).toBe('Merchant Secret Key not found');
    });

    it('should return isValid false when merchant status is not ACTIVE', async () => {
      mockPrismaClient.merchantSignature.findUnique.mockResolvedValue({
        userId: 1,
        secretKey: 'secret123',
        clientId: 'client123',
        status: 'INACTIVE',
        previousSecretKey: null,
        payinUrl: null,
        payoutUrl: null,
      });

      const result = await service.validateSignature(baseDto);

      expect(result.isValid).toBe(false);
      expect(result.userId).toBe(1);
      expect(result.message).toBe('Merchant Signature Status is not Active');
    });

    it('should return isValid false when timestamp is expired', async () => {
      mockPrismaClient.merchantSignature.findUnique.mockResolvedValue({
        userId: 1,
        secretKey: 'secret123',
        clientId: 'client123',
        status: 'ACTIVE',
        previousSecretKey: 'oldSecret',
        payinUrl: 'http://payin.com',
        payoutUrl: 'http://payout.com',
      });

      jest
        .spyOn(CryptoHelper, 'buildStringToSign')
        .mockReturnValue('stringToSign');
      jest.spyOn(CryptoHelper, 'isTimestampValid').mockReturnValue(false);

      const result = await service.validateSignature(baseDto);

      expect(result.isValid).toBe(false);
      expect(result.userId).toBe(1);
      expect(result.message).toBe('Request is expired');
    });

    it('should return isValid true when signature is valid', async () => {
      mockPrismaClient.merchantSignature.findUnique.mockResolvedValue({
        userId: 1,
        secretKey: 'secret123',
        clientId: 'client123',
        status: 'ACTIVE',
        previousSecretKey: 'oldSecret',
        payinUrl: 'http://payin.com',
        payoutUrl: 'http://payout.com',
      });

      jest
        .spyOn(CryptoHelper, 'buildStringToSign')
        .mockReturnValue('stringToSign');
      jest.spyOn(CryptoHelper, 'isTimestampValid').mockReturnValue(true);
      jest.spyOn(CryptoHelper, 'verifySignature').mockReturnValue(true);

      const result = await service.validateSignature(baseDto);

      expect(result.isValid).toBe(true);
      expect(result.userId).toBe(1);
      expect(result.message).toBe('Signature is valid');
    });

    it('should return isValid false when signature is invalid', async () => {
      mockPrismaClient.merchantSignature.findUnique.mockResolvedValue({
        userId: 1,
        secretKey: 'secret123',
        clientId: 'client123',
        status: 'ACTIVE',
        previousSecretKey: 'oldSecret',
        payinUrl: 'http://payin.com',
        payoutUrl: 'http://payout.com',
      });

      jest
        .spyOn(CryptoHelper, 'buildStringToSign')
        .mockReturnValue('stringToSign');
      jest.spyOn(CryptoHelper, 'isTimestampValid').mockReturnValue(true);
      jest.spyOn(CryptoHelper, 'verifySignature').mockReturnValue(false);

      const result = await service.validateSignature(baseDto);

      expect(result.isValid).toBe(false);
      expect(result.userId).toBe(1);
      expect(result.message).toBe('Signature is invalid');
    });
  });

  describe('findMerchantByCliendIdOrThrow', () => {
    it('should return merchant signature with all fields', async () => {
      const clientId = 'client123';
      const signature = {
        id: 1,
        userId: 10,
        clientId: 'client123',
        secretKey: 'secret123',
        previousSecretKey: 'oldSecret',
        status: 'ACTIVE',
        payinUrl: 'http://payin.com',
        payoutUrl: 'http://payout.com',
      };
      mockPrismaClient.merchantSignature.findFirstOrThrow.mockResolvedValue(
        signature,
      );

      const result = await service.findMerchantByCliendIdOrThrow(clientId);

      expect(
        mockPrismaClient.merchantSignature.findFirstOrThrow,
      ).toHaveBeenCalledWith({
        where: { clientId },
      });
      expect(result).toEqual(signature);
      expect(result.clientId).toBe('client123');
      expect(result.secretKey).toBe('secret123');
      expect(result.status).toBe('ACTIVE');
    });

    it('should throw if merchant signature not found', async () => {
      mockPrismaClient.merchantSignature.findFirstOrThrow.mockRejectedValue(
        new Error('Not found'),
      );

      await expect(
        service.findMerchantByCliendIdOrThrow('unknown'),
      ).rejects.toThrow('Not found');
    });
  });
});
