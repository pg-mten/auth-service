import { Test, TestingModule } from '@nestjs/testing';
import { PoliciesGuard } from './policies.guard';
import { Reflector } from '@nestjs/core';
import { CaslCacheService } from './casl-cache.service';
import { ClsService } from 'nestjs-cls';
import { ExecutionContext } from '@nestjs/common';

describe('PoliciesGuard', () => {
  let guard: PoliciesGuard;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
    get: jest.fn(),
  };

  const mockCaslCache = {
    getAbility: jest.fn(),
  };

  const mockCls = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PoliciesGuard,
        { provide: Reflector, useValue: mockReflector },
        { provide: CaslCacheService, useValue: mockCaslCache },
        { provide: ClsService, useValue: mockCls },
      ],
    }).compile();

    guard = module.get<PoliciesGuard>(PoliciesGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let context: ExecutionContext;
    let request: any;

    beforeEach(() => {
      request = {
        path: '/test',
        user: { userId: 1, role: 'USER' },
      };
      context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(request),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as any;
    });

    it('should return true if public api', async () => {
      mockReflector.getAllAndOverride.mockReturnValueOnce(true); // PublicApi
      expect(await guard.canActivate(context)).toBe(true);
    });

    // if (!authInfo) return false;
    it('should return false if no user', async () => {
      request.user = undefined;
      mockReflector.getAllAndOverride.mockReturnValue(false);
      expect(await guard.canActivate(context)).toBe(false);
    });

    it('should return true if admin super', async () => {
      request.user.role = 'ADMIN_SUPER';
      mockReflector.getAllAndOverride.mockReturnValue(false);
      expect(await guard.canActivate(context)).toBe(true);
    });

    it('should execute handlers and return true if allowed', async () => {
      mockReflector.getAllAndOverride.mockReturnValue(false);
      const ability = { can: jest.fn().mockReturnValue(true) };
      mockCaslCache.getAbility.mockResolvedValue(ability);

      const handler = (a: any) => a.can('read', 'all');
      mockReflector.get.mockReturnValue([handler]);

      expect(await guard.canActivate(context)).toBe(true);
      expect(mockCaslCache.getAbility).toHaveBeenCalledWith(1);
    });

    it('should return false if handler fails', async () => {
      mockReflector.getAllAndOverride.mockReturnValue(false);
      const ability = { can: jest.fn().mockReturnValue(false) };
      mockCaslCache.getAbility.mockResolvedValue(ability);

      const handler = (a: any) => a.can('cannot', 'all');
      mockReflector.get.mockReturnValue([handler]);

      expect(await guard.canActivate(context)).toBe(false);
    });
  });
});
