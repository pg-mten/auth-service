import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsService } from './permissions.service';
import { PRISMA_SERVICE } from '../prisma/prisma.provider';
import { DateHelper } from 'src/shared/helper/date.helper';

describe('PermissionsService', () => {
  let service: PermissionsService;

  const mockPrismaClient = {
    permission: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    role: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        { provide: PRISMA_SERVICE, useValue: mockPrismaClient },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create permission with all fields filled', async () => {
      const dto = {
        action: 'read',
        subject: 'Dashboard',
        role_id: 1,
        inverted: false,
        conditions: { created_by: '$userId' },
        field: ['title', 'summary'],
        reason: 'Can only read own articles',
      };
      const created = { id: 1, ...dto, roleId: 1, deletedAt: null };
      mockPrismaClient.permission.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(mockPrismaClient.permission.create).toHaveBeenCalledWith({
        data: dto,
      });
      expect(result).toEqual(created);
      expect(result.action).toBe('read');
      expect(result.subject).toBe('Dashboard');
      expect(result.inverted).toBe(false);
      expect(result.conditions).toEqual({ created_by: '$userId' });
      expect(result.field).toEqual(['title', 'summary']);
      expect(result.reason).toBe('Can only read own articles');
    });

    it('should create permission with optional fields omitted', async () => {
      const dto = { action: 'manage', subject: 'all', role_id: 2 };
      const created = {
        id: 2,
        action: 'manage',
        subject: 'all',
        roleId: 2,
        inverted: false,
        conditions: null,
        field: null,
        reason: null,
        deletedAt: null,
      };
      mockPrismaClient.permission.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(mockPrismaClient.permission.create).toHaveBeenCalledWith({
        data: dto,
      });
      expect(result.conditions).toBeNull();
      expect(result.field).toBeNull();
      expect(result.reason).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all active permissions', async () => {
      const permissions = [
        {
          id: 1,
          action: 'read',
          subject: 'Dashboard',
          roleId: 1,
          deletedAt: null,
        },
        {
          id: 2,
          action: 'create',
          subject: 'Article',
          roleId: 1,
          deletedAt: null,
        },
        { id: 3, action: 'manage', subject: 'all', roleId: 2, deletedAt: null },
      ];
      mockPrismaClient.permission.findMany.mockResolvedValue(permissions);

      const result = await service.findAll();

      expect(mockPrismaClient.permission.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
      });
      expect(result).toHaveLength(3);

      expect(result[0].id).toBe(1);
      expect(result[0].action).toBe('read');
      expect(result[0].subject).toBe('Dashboard');

      expect(result[1].id).toBe(2);
      expect(result[1].action).toBe('create');
      expect(result[1].subject).toBe('Article');

      expect(result[2].id).toBe(3);
      expect(result[2].action).toBe('manage');
      expect(result[2].subject).toBe('all');
    });
  });

  describe('findOne', () => {
    it('should return a permission by id with all fields filled', async () => {
      const permission = {
        id: 1,
        action: 'read',
        subject: 'Dashboard',
        roleId: 1,
        inverted: false,
        conditions: { created_by: 1 },
        field: ['title'],
        reason: 'test reason',
        deletedAt: null,
      };
      mockPrismaClient.permission.findUnique.mockResolvedValue(permission);

      const result = await service.findOne(1);

      expect(mockPrismaClient.permission.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(permission);
      expect(result!.id).toBe(1);
      expect(result!.action).toBe('read');
      expect(result!.subject).toBe('Dashboard');
      expect(result!.inverted).toBe(false);
      expect(result!.conditions).toEqual({ created_by: 1 });
      expect(result!.field).toEqual(['title']);
      expect(result!.reason).toBe('test reason');
    });

    it('should return a permission with nullable fields null', async () => {
      const permission = {
        id: 2,
        action: 'manage',
        subject: 'all',
        roleId: 2,
        inverted: false,
        conditions: null,
        field: null,
        reason: null,
        deletedAt: null,
      };
      mockPrismaClient.permission.findUnique.mockResolvedValue(permission);

      const result = await service.findOne(2);

      expect(result!.conditions).toBeNull();
      expect(result!.field).toBeNull();
      expect(result!.reason).toBeNull();
    });

    it('should return null if permission not found', async () => {
      mockPrismaClient.permission.findUnique.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(mockPrismaClient.permission.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a permission', async () => {
      const dto = { action: 'create', subject: 'Article' };
      const updated = {
        id: 1,
        action: 'create',
        subject: 'Article',
        roleId: 1,
      };
      mockPrismaClient.permission.update.mockResolvedValue(updated);

      const result = await service.update(1, dto);

      expect(mockPrismaClient.permission.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: dto,
      });
      expect(result).toEqual(updated);
      expect(result.action).toBe('create');
      expect(result.subject).toBe('Article');
    });
  });

  describe('softDelete', () => {
    it('should set deletedAt timestamp on the permission', async () => {
      const now = new Date('2026-02-14T00:00:00.000Z');
      jest
        .spyOn(DateHelper, 'now')
        .mockReturnValue({ toJSDate: () => now } as any);

      const deleted = {
        id: 1,
        action: 'read',
        subject: 'Dashboard',
        deletedAt: now,
      };
      mockPrismaClient.permission.update.mockResolvedValue(deleted);

      const result = await service.softDelete(1);

      expect(mockPrismaClient.permission.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { deletedAt: now },
      });
      expect(result).toEqual(deleted);
      expect(result.deletedAt).toBe(now);
    });
  });

  describe('assignToRole', () => {
    it('should update permission with roleId', async () => {
      const updated = {
        id: 1,
        action: 'read',
        subject: 'Dashboard',
        roleId: 10,
      };
      mockPrismaClient.permission.update.mockResolvedValue(updated);

      const result = await service.assignToRole(1, 10);

      expect(mockPrismaClient.permission.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { roleId: 10 },
      });
      expect(result.roleId).toBe(10);
    });
  });

  describe('unassignFromRole', () => {
    it('should set roleId to null', async () => {
      const updated = {
        id: 1,
        action: 'read',
        subject: 'Dashboard',
        roleId: null,
      };
      mockPrismaClient.permission.update.mockResolvedValue(updated);

      const result = await service.unassignFromRole(1);

      expect(mockPrismaClient.permission.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { roleId: null },
      });
      expect(result.roleId).toBeNull();
    });
  });

  describe('assignMultiplePermissions', () => {
    it('should assign multiple permissions to a role', async () => {
      const role = { id: 5, name: 'admin' };
      mockPrismaClient.role.findUnique.mockResolvedValue(role);
      mockPrismaClient.permission.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.assignMultiplePermissions(5, [1, 2, 3]);

      expect(mockPrismaClient.role.findUnique).toHaveBeenCalledWith({
        where: { id: 5 },
      });
      expect(mockPrismaClient.permission.updateMany).toHaveBeenCalledWith({
        where: { id: { in: [1, 2, 3] } },
        data: { roleId: 5 },
      });
      expect(result).toEqual({ count: 3 });
    });

    it('should throw error if role not found', async () => {
      mockPrismaClient.role.findUnique.mockResolvedValue(null);

      await expect(
        service.assignMultiplePermissions(999, [1, 2, 3]),
      ).rejects.toThrow('Role not found');

      expect(mockPrismaClient.role.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
      expect(mockPrismaClient.permission.updateMany).not.toHaveBeenCalled();
    });
  });
});
