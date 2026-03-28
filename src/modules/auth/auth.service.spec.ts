import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException } from '@nestjs/common';

import { AuthService } from './auth.service';
import { IAuthRepository } from './interfaces/auth.repository.interface';
import { IHashProvider } from './providers/hash.provider.interface';
import { ITokenProvider } from './providers/token.provider.interface';
import { PrismaService } from 'src/prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockRepository: jest.Mocked<IAuthRepository> = {
    findUserByEmailAndUsername: jest.fn(),
    registerUser: jest.fn(),
    findUserByEmail: jest.fn(),
    createToken: jest.fn(),
    setAllRefreshRevokedByUserId: jest.fn(),
    findTokenNotRevokedByUserId: jest.fn(),
    revokeRefreshToken: jest.fn(),
  };

  const mockHashProvider: jest.Mocked<IHashProvider> = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  const mockTokenProvider: jest.Mocked<ITokenProvider> = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockPrismaService = {
    $transaction: jest.fn((callback) => callback({})),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: 'AuthRepository',
          useValue: mockRepository,
        },
        {
          provide: 'HashProvider',
          useValue: mockHashProvider,
        },
        {
          provide: 'TokenProvider',
          useValue: mockTokenProvider,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  const userData = {
    email: 'test@email.com',
    username: 'testuser',
    pass: '12345h6',
  };

  describe('register', () => {
    it('should throw ConflictException if user already exists', async () => {
      mockRepository.findUserByEmailAndUsername.mockResolvedValue(true as any);

      await expect(service.register(userData)).rejects.toThrow(
        ConflictException,
      );

      expect(mockRepository.findUserByEmailAndUsername).toHaveBeenCalledWith(
        userData.email,
        userData.username,
      );

      expect(mockRepository.registerUser).not.toHaveBeenCalled();
    });

    it('should create a new user when email and username are available', async () => {
      mockRepository.findUserByEmailAndUsername.mockResolvedValue(false);
      mockHashProvider.hash.mockResolvedValue('hashed-password');

      await service.register(userData);

      expect(mockHashProvider.hash).toHaveBeenCalledWith(userData.pass);

      expect(mockRepository.registerUser).toHaveBeenCalledWith({
        email: userData.email,
        username: userData.username,
        passwordHash: 'hashed-password',
      });
    });

    it('should call repository.create only once', async () => {
      mockRepository.findUserByEmailAndUsername.mockResolvedValue(false);
      mockHashProvider.hash.mockResolvedValue('hashed-password');

      await service.register(userData);

      expect(mockRepository.registerUser).toHaveBeenCalledTimes(1);
    });
  });
  describe('login', () => {
    const loginData = {
      email: 'test@email.com',
      pass: 'Password8193',
    };

    const userFromDb = {
      id: 'user-id-1',
      email: loginData.email,
      passwordHash: 'hashed-password',
    };

    it('should throw BadRequestException if user is not found', async () => {
      mockRepository.findUserByEmail.mockResolvedValue(null);

      await expect(service.login(loginData)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockRepository.findUserByEmail).toHaveBeenCalledWith(
        loginData.email,
        expect.any(Object), // 👈 tx
      );

      expect(mockHashProvider.compare).not.toHaveBeenCalled();
      expect(mockTokenProvider.sign).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if password is invalid', async () => {
      mockRepository.findUserByEmail.mockResolvedValue(userFromDb as any);
      mockHashProvider.compare.mockResolvedValue(false);

      await expect(service.login(loginData)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockHashProvider.compare).toHaveBeenCalledWith(
        loginData.pass,
        userFromDb.passwordHash,
      );

      expect(mockTokenProvider.sign).not.toHaveBeenCalled();
    });

    it('should return access and refresh tokens when credentials are valid', async () => {
      mockRepository.findUserByEmail.mockResolvedValue(userFromDb as any);
      mockHashProvider.compare.mockResolvedValue(true);

      mockTokenProvider.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      mockHashProvider.hash.mockResolvedValue('hashed-refresh');

      const result = await service.login(loginData);

      expect(mockTokenProvider.sign).toHaveBeenNthCalledWith(
        1,
        { sub: userFromDb.id },
        'access',
      );

      expect(mockTokenProvider.sign).toHaveBeenNthCalledWith(
        2,
        { sub: userFromDb.id },
        'refresh',
      );

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should revoke old tokens and persist new refresh token', async () => {
      mockRepository.findUserByEmail.mockResolvedValue(userFromDb as any);
      mockHashProvider.compare.mockResolvedValue(true);

      mockTokenProvider.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      mockHashProvider.hash.mockResolvedValue('hashed-refresh');

      await service.login(loginData);

      expect(mockRepository.setAllRefreshRevokedByUserId).toHaveBeenCalledWith(
        userFromDb.id,
        expect.any(Object),
      );

      expect(mockRepository.createToken).toHaveBeenCalledWith(
        userFromDb.id,
        'hashed-refresh',
        expect.any(Object),
      );
    });

    it('should call tokenProvider.sign twice (access + refresh)', async () => {
      mockRepository.findUserByEmail.mockResolvedValue(userFromDb as any);
      mockHashProvider.compare.mockResolvedValue(true);

      mockTokenProvider.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      mockHashProvider.hash.mockResolvedValue('hashed-refresh');

      await service.login(loginData);

      expect(mockTokenProvider.sign).toHaveBeenCalledTimes(2);
    });
  });

  describe('refresh', () => {
    const refreshToken = 'valid-refresh-token';
    const refreshPayload = {
      sub: 'user-id-1',
    };

    const activeRefreshFromDb = {
      id: 'refresh-id-1',
      tokenHash: 'stored-refresh-hash',
      expiresAt: new Date(Date.now() + 60_000),
    };

    it('should throw BadRequestException if active refresh token is not found', async () => {
      mockTokenProvider.verify.mockReturnValue(refreshPayload as never);
      mockRepository.findTokenNotRevokedByUserId.mockResolvedValue(null);

      await expect(service.refresh(refreshToken)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockTokenProvider.verify).toHaveBeenCalledWith(
        refreshToken,
        'refresh',
      );

      expect(mockRepository.findTokenNotRevokedByUserId).toHaveBeenCalledWith(
        refreshPayload.sub,
        expect.any(Object),
      );

      expect(mockHashProvider.compare).not.toHaveBeenCalled();
      expect(mockRepository.createToken).not.toHaveBeenCalled();
      expect(mockRepository.revokeRefreshToken).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if active refresh token is expired', async () => {
      mockTokenProvider.verify.mockReturnValue(refreshPayload as never);
      mockRepository.findTokenNotRevokedByUserId.mockResolvedValue({
        ...activeRefreshFromDb,
        expiresAt: new Date(Date.now() - 60_000),
      });

      await expect(service.refresh(refreshToken)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockHashProvider.compare).not.toHaveBeenCalled();
      expect(mockRepository.createToken).not.toHaveBeenCalled();
      expect(mockRepository.revokeRefreshToken).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if refresh token hash comparison fails', async () => {
      mockTokenProvider.verify.mockReturnValue(refreshPayload as never);
      mockRepository.findTokenNotRevokedByUserId.mockResolvedValue(
        activeRefreshFromDb,
      );
      mockHashProvider.compare.mockResolvedValue(false);

      await expect(service.refresh(refreshToken)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockHashProvider.compare).toHaveBeenCalledWith(
        refreshToken,
        activeRefreshFromDb.tokenHash,
      );

      expect(mockRepository.createToken).not.toHaveBeenCalled();
      expect(mockRepository.revokeRefreshToken).not.toHaveBeenCalled();
    });

    it('should return new access and refresh tokens when refresh token is valid', async () => {
      mockTokenProvider.verify.mockReturnValue(refreshPayload as never);
      mockRepository.findTokenNotRevokedByUserId.mockResolvedValue(
        activeRefreshFromDb,
      );
      mockHashProvider.compare.mockResolvedValue(true);
      mockTokenProvider.sign
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token');
      mockHashProvider.hash.mockResolvedValue('new-refresh-hash');
      mockRepository.createToken.mockResolvedValue('new-refresh-id');

      const result = await service.refresh(refreshToken);

      expect(mockTokenProvider.sign).toHaveBeenNthCalledWith(
        1,
        { sub: refreshPayload.sub },
        'access',
      );

      expect(mockTokenProvider.sign).toHaveBeenNthCalledWith(
        2,
        { sub: refreshPayload.sub },
        'refresh',
      );

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });

    it('should create a new refresh token and revoke the current one', async () => {
      mockTokenProvider.verify.mockReturnValue(refreshPayload as never);
      mockRepository.findTokenNotRevokedByUserId.mockResolvedValue(
        activeRefreshFromDb,
      );
      mockHashProvider.compare.mockResolvedValue(true);
      mockTokenProvider.sign
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token');
      mockHashProvider.hash.mockResolvedValue('new-refresh-hash');
      mockRepository.createToken.mockResolvedValue('new-refresh-id');

      await service.refresh(refreshToken);

      expect(mockHashProvider.hash).toHaveBeenCalledWith('new-refresh-token');

      expect(mockRepository.createToken).toHaveBeenCalledWith(
        refreshPayload.sub,
        'new-refresh-hash',
        expect.any(Object),
      );

      expect(mockRepository.revokeRefreshToken).toHaveBeenCalledWith(
        activeRefreshFromDb.id,
        'new-refresh-id',
        expect.any(Object),
      );
    });
  });
});
