import { Test, TestingModule } from '@nestjs/testing';
import { MerchantDetailService } from './merchant-detail.service';
import { PRISMA_SERVICE } from '../prisma/prisma.provider';

describe('MerchantDetailService', () => {
  let service: MerchantDetailService;

  const mockPrismaClient = {
    merchantDetail: {
      findMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
    },
  };

  // Factory for fully populated merchant detail records (as returned by Prisma)
  const makeMerchantRecord = (
    i: number,
    opts?: { nullableNull?: boolean },
  ) => ({
    id: i,
    userId: i * 10,
    ownerName: `Owner ${i}`,
    businessName: `Business ${i}`,
    brandName: `Brand ${i}`,
    phoneNumber: `0821000000${i}`,
    nik: `320000000000${i}`,
    ktpImage: opts?.nullableNull ? null : `ktp_${i}.jpg`,
    npwp: `NPWP-${i}`,
    address: `${i}00 Commerce St`,
    province: `Province ${i}`,
    regency: `Regency ${i}`,
    district: `District ${i}`,
    village: `Village ${i}`,
    postalCode: `1000${i}`,
    bankCode: `00${i}`,
    bankName: `Bank ${i}`,
    accountNumber: `MACC-${i}`,
    accountHolderName: `MHolder ${i}`,
    siupFile: opts?.nullableNull ? null : `siup_${i}.pdf`,
    coordinate: opts?.nullableNull ? null : `-6.${i},106.${i}`,
    user: {
      id: i * 10,
      email: `merchant${i}@test.com`,
      password: 'hashed',
      roleId: 2,
    },
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MerchantDetailService,
        { provide: PRISMA_SERVICE, useValue: mockPrismaClient },
      ],
    }).compile();

    service = module.get<MerchantDetailService>(MerchantDetailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all merchants mapped to MerchantDto with all fields', async () => {
      const merchants = [
        makeMerchantRecord(1),
        makeMerchantRecord(2),
        makeMerchantRecord(3),
      ];
      mockPrismaClient.merchantDetail.findMany.mockResolvedValue(merchants);

      const result = await service.findAll();

      expect(mockPrismaClient.merchantDetail.findMany).toHaveBeenCalledWith({
        include: { user: true },
      });
      expect(result).toHaveLength(3);

      // Verify all fields on first element
      expect(result[0].merchantId).toBe(1);
      expect(result[0].userId).toBe(10);
      expect(result[0].email).toBe('merchant1@test.com');
      expect(result[0].ownerName).toBe('Owner 1');
      expect(result[0].businessName).toBe('Business 1');
      expect(result[0].brandName).toBe('Brand 1');
      expect(result[0].phoneNumber).toBe('08210000001');
      expect(result[0].nik).toBe('3200000000001');
      expect(result[0].ktpImage).toBe('ktp_1.jpg');
      expect(result[0].npwp).toBe('NPWP-1');
      expect(result[0].address).toBe('100 Commerce St');
      expect(result[0].province).toBe('Province 1');
      expect(result[0].regency).toBe('Regency 1');
      expect(result[0].district).toBe('District 1');
      expect(result[0].village).toBe('Village 1');
      expect(result[0].postalCode).toBe('10001');
      expect(result[0].bankCode).toBe('001');
      expect(result[0].bankName).toBe('Bank 1');
      expect(result[0].accountNumber).toBe('MACC-1');
      expect(result[0].accountHolderName).toBe('MHolder 1');
      expect(result[0].siupFile).toBe('siup_1.pdf');
      expect(result[0].coordinate).toBe('-6.1,106.1');

      // Verify identity of remaining elements
      expect(result[1].merchantId).toBe(2);
      expect(result[1].email).toBe('merchant2@test.com');

      expect(result[2].merchantId).toBe(3);
      expect(result[2].email).toBe('merchant3@test.com');
    });

    it('should handle merchants with nullable fields set to null', async () => {
      const merchants = [
        makeMerchantRecord(1, { nullableNull: true }),
        makeMerchantRecord(2, { nullableNull: true }),
        makeMerchantRecord(3, { nullableNull: true }),
      ];
      mockPrismaClient.merchantDetail.findMany.mockResolvedValue(merchants);

      const result = await service.findAll();

      expect(result).toHaveLength(3);
      expect(result[0].ktpImage).toBeNull();
      expect(result[0].siupFile).toBeNull();
      expect(result[0].coordinate).toBeNull();
    });
  });

  describe('findAllNames', () => {
    it('should return merchant names', async () => {
      const merchants = [
        { id: 1, businessName: 'Merchant One' },
        { id: 2, businessName: 'Merchant Two' },
        { id: 3, businessName: 'Merchant Three' },
      ];
      mockPrismaClient.merchantDetail.findMany.mockResolvedValue(merchants);

      const result = await service.findAllNames();

      expect(mockPrismaClient.merchantDetail.findMany).toHaveBeenCalledWith({
        select: { id: true, businessName: true },
      });
      expect(result).toHaveLength(3);

      expect(result[0].id).toBe(1);
      expect(result[0].businessName).toBe('Merchant One');

      expect(result[1].id).toBe(2);
      expect(result[1].businessName).toBe('Merchant Two');

      expect(result[2].id).toBe(3);
      expect(result[2].businessName).toBe('Merchant Three');
    });
  });

  describe('findIds', () => {
    it('should return merchants by ids with all fields', async () => {
      const merchants = [
        makeMerchantRecord(1),
        makeMerchantRecord(2),
        makeMerchantRecord(3),
      ];
      mockPrismaClient.merchantDetail.findMany.mockResolvedValue(merchants);

      const result = await service.findIds([1, 2, 3]);

      expect(mockPrismaClient.merchantDetail.findMany).toHaveBeenCalledWith({
        where: { id: { in: [1, 2, 3] } },
        include: { user: true },
      });
      expect(result).toHaveLength(3);

      // Verify all fields on first element
      expect(result[0].merchantId).toBe(1);
      expect(result[0].userId).toBe(10);
      expect(result[0].email).toBe('merchant1@test.com');
      expect(result[0].ownerName).toBe('Owner 1');
      expect(result[0].businessName).toBe('Business 1');
      expect(result[0].brandName).toBe('Brand 1');
      expect(result[0].phoneNumber).toBe('08210000001');
      expect(result[0].nik).toBe('3200000000001');
      expect(result[0].ktpImage).toBe('ktp_1.jpg');
      expect(result[0].npwp).toBe('NPWP-1');
      expect(result[0].address).toBe('100 Commerce St');
      expect(result[0].province).toBe('Province 1');
      expect(result[0].regency).toBe('Regency 1');
      expect(result[0].district).toBe('District 1');
      expect(result[0].village).toBe('Village 1');
      expect(result[0].postalCode).toBe('10001');
      expect(result[0].bankCode).toBe('001');
      expect(result[0].bankName).toBe('Bank 1');
      expect(result[0].accountNumber).toBe('MACC-1');
      expect(result[0].accountHolderName).toBe('MHolder 1');
      expect(result[0].siupFile).toBe('siup_1.pdf');
      expect(result[0].coordinate).toBe('-6.1,106.1');

      expect(result[1].merchantId).toBe(2);
      expect(result[2].merchantId).toBe(3);
    });

    it('should handle merchants with nullable fields set to null', async () => {
      const merchants = [
        makeMerchantRecord(1, { nullableNull: true }),
        makeMerchantRecord(2, { nullableNull: true }),
        makeMerchantRecord(3, { nullableNull: true }),
      ];
      mockPrismaClient.merchantDetail.findMany.mockResolvedValue(merchants);

      const result = await service.findIds([1, 2, 3]);

      expect(result[0].ktpImage).toBeNull();
      expect(result[0].siupFile).toBeNull();
      expect(result[0].coordinate).toBeNull();
    });
  });

  describe('findOneThrow', () => {
    it('should return one merchant with all fields', async () => {
      const merchant = makeMerchantRecord(1);
      mockPrismaClient.merchantDetail.findUniqueOrThrow.mockResolvedValue(
        merchant,
      );

      const result = await service.findOneThrow(1);

      expect(
        mockPrismaClient.merchantDetail.findUniqueOrThrow,
      ).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { user: true },
      });
      expect(result.merchantId).toBe(1);
      expect(result.userId).toBe(10);
      expect(result.email).toBe('merchant1@test.com');
      expect(result.ownerName).toBe('Owner 1');
      expect(result.businessName).toBe('Business 1');
      expect(result.ktpImage).toBe('ktp_1.jpg');
      expect(result.siupFile).toBe('siup_1.pdf');
      expect(result.coordinate).toBe('-6.1,106.1');
    });

    it('should return one merchant with nullable fields null', async () => {
      const merchant = makeMerchantRecord(1, { nullableNull: true });
      mockPrismaClient.merchantDetail.findUniqueOrThrow.mockResolvedValue(
        merchant,
      );

      const result = await service.findOneThrow(1);

      expect(result.merchantId).toBe(1);
      expect(result.ktpImage).toBeNull();
      expect(result.siupFile).toBeNull();
      expect(result.coordinate).toBeNull();
    });

    it('should throw if merchant not found', async () => {
      mockPrismaClient.merchantDetail.findUniqueOrThrow.mockRejectedValue(
        new Error('Not found'),
      );

      await expect(service.findOneThrow(999)).rejects.toThrow('Not found');
    });
  });

  describe('update', () => {
    it('should update merchant detail and return updated record', async () => {
      const dto = { businessName: 'Updated Name' };
      const merchant = makeMerchantRecord(1);
      const updated = { ...merchant, businessName: 'Updated Name' };

      mockPrismaClient.merchantDetail.findUniqueOrThrow.mockResolvedValue(
        merchant,
      );
      mockPrismaClient.merchantDetail.update.mockResolvedValue(updated);

      const result = await service.update(1, dto);

      expect(
        mockPrismaClient.merchantDetail.findUniqueOrThrow,
      ).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { user: true },
      });
      expect(mockPrismaClient.merchantDetail.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining(dto),
      });
      expect(result.businessName).toBe('Updated Name');
    });

    it('should throw if merchant to update not found', async () => {
      mockPrismaClient.merchantDetail.findUniqueOrThrow.mockRejectedValue(
        new Error('Not found'),
      );

      await expect(service.update(999, { businessName: 'X' })).rejects.toThrow(
        'Not found',
      );
      expect(mockPrismaClient.merchantDetail.update).not.toHaveBeenCalled();
    });
  });
});
