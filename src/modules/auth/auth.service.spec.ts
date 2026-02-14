import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../users/user.service';
import { UserProfileService } from '../users/user-profile.service';
import { JwtService } from '@nestjs/jwt';
import { AuthHelper } from 'src/shared/helper/auth.helper';
import { LoginDto } from './dto/login.dto';
import { AuthInfoDto } from '../../microservice/auth/dto/auth-info.dto';

describe('AuthService', () => {
  let service: AuthService;

  const mockUserService = {
    findOneByEmailThrow: jest.fn(),
  };

  const mockUserProfileService = {
    findProfileIdByUserIdAndRole: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: UserProfileService, useValue: mockUserProfileService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return AuthInfoDto when user is valid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const user = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        role: { name: 'admin' },
      };
      const profileId = 123;

      mockUserService.findOneByEmailThrow.mockResolvedValue(user);
      jest.spyOn(AuthHelper, 'verifyPassword').mockResolvedValue(true);
      mockUserProfileService.findProfileIdByUserIdAndRole.mockResolvedValue(
        profileId,
      );

      const result = await service.validateUser(loginDto);

      expect(mockUserService.findOneByEmailThrow).toHaveBeenCalledWith(
        loginDto.email,
      );
      expect(AuthHelper.verifyPassword).toHaveBeenCalledWith(
        user.password,
        loginDto.password,
      );
      expect(
        mockUserProfileService.findProfileIdByUserIdAndRole,
      ).toHaveBeenCalledWith(user.id, user.role.name);
      expect(result).toBeInstanceOf(AuthInfoDto);
      expect(result?.userId).toBe(user.id);
      expect(result?.profileId).toBe(profileId);
      expect(result?.role).toBe(user.role.name);
    });

    it('should return null when password verification fails', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongPassword',
      };
      const user = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        role: { name: 'admin' },
      };

      mockUserService.findOneByEmailThrow.mockResolvedValue(user);
      jest.spyOn(AuthHelper, 'verifyPassword').mockResolvedValue(false);

      const result = await service.validateUser(loginDto);

      expect(result).toBeNull();
    });

    it('should return null when user not found (throws error)', async () => {
      // Assuming findOneByEmailThrow throws error if not found, usually caught in service
      // The service implementation catches errors and returns null
      const loginDto: LoginDto = {
        email: 'unknown@example.com',
        password: 'password',
      };
      mockUserService.findOneByEmailThrow.mockRejectedValue(
        new Error('User not found'),
      );

      const result = await service.validateUser(loginDto);

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return AuthDto with token', async () => {
      const authInfoDto = new AuthInfoDto({
        userId: 1,
        profileId: 1,
        role: 'user',
      });
      const token = 'jwtToken';

      mockJwtService.signAsync.mockResolvedValue(token);

      const result = await service.login(authInfoDto);

      expect(mockJwtService.signAsync).toHaveBeenCalled();
      expect(result.token).toBe(token);
      expect(result.authInfo).toBe(authInfoDto);
    });
  });
});
