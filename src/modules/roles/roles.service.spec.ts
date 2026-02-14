import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { PRISMA_SERVICE } from '../prisma/prisma.provider';

describe('RolesService', () => {
  let service: RolesService;

  const mockPrismaClient = {
    role: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: PRISMA_SERVICE, useValue: mockPrismaClient },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create role', async () => {
      const dto = { name: 'ADMIN' };
      const created = { id: 1, name: 'ADMIN' };
      mockPrismaClient.role.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(mockPrismaClient.role.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toEqual(created);
      expect(result.name).toBe('ADMIN');
    });
  });

  describe('findAll', () => {
    it('should return roles with permissions', async () => {
      const roles = [
        {
          id: 1,
          name: 'ADMIN',
          Permission: [{ id: 1, action: 'manage', subject: 'all' }],
        },
        {
          id: 2,
          name: 'EDITOR',
          Permission: [{ id: 2, action: 'read', subject: 'Article' }],
        },
        { id: 3, name: 'VIEWER', Permission: [] },
      ];
      mockPrismaClient.role.findMany.mockResolvedValue(roles);

      const result = await service.findAll();

      expect(mockPrismaClient.role.findMany).toHaveBeenCalledWith({
        include: { Permission: true },
      });
      expect(result).toHaveLength(3);

      expect(result[0].id).toBe(1);
      expect(result[0].name).toBe('ADMIN');
      expect(result[0].Permission).toHaveLength(1);

      expect(result[1].id).toBe(2);
      expect(result[1].name).toBe('EDITOR');
      expect(result[1].Permission).toHaveLength(1);

      expect(result[2].id).toBe(3);
      expect(result[2].name).toBe('VIEWER');
      expect(result[2].Permission).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a role with permissions by id', async () => {
      const role = {
        id: 1,
        name: 'ADMIN',
        Permission: [
          { id: 1, action: 'manage', subject: 'all' },
          { id: 2, action: 'read', subject: 'Dashboard' },
          { id: 3, action: 'create', subject: 'Article' },
        ],
      };
      mockPrismaClient.role.findUnique.mockResolvedValue(role);

      const result = await service.findOne(1);

      expect(mockPrismaClient.role.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { Permission: true },
      });
      expect(result!.id).toBe(1);
      expect(result!.name).toBe('ADMIN');
      expect(result!.Permission).toHaveLength(3);
      expect(result!.Permission[0].action).toBe('manage');
      expect(result!.Permission[1].action).toBe('read');
      expect(result!.Permission[2].action).toBe('create');
    });

    it('should return null if role not found', async () => {
      mockPrismaClient.role.findUnique.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(mockPrismaClient.role.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
        include: { Permission: true },
      });
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a role', async () => {
      const dto = { name: 'SUPER_ADMIN' };
      const updated = { id: 1, name: 'SUPER_ADMIN' };
      mockPrismaClient.role.update.mockResolvedValue(updated);

      const result = await service.update(1, dto);

      expect(mockPrismaClient.role.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: dto,
      });
      expect(result).toEqual(updated);
      expect(result.name).toBe('SUPER_ADMIN');
    });
  });

  describe('remove', () => {
    it('should delete a role', async () => {
      const deleted = { id: 1, name: 'ADMIN' };
      mockPrismaClient.role.delete.mockResolvedValue(deleted);

      const result = await service.remove(1);

      expect(mockPrismaClient.role.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(deleted);
      expect(result.id).toBe(1);
    });
  });
});
