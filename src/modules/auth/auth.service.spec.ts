import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException } from '@nestjs/common';

import { AuthService } from './auth.service';
import { IAuthRepository } from './interfaces/auth.repository.interface';
import { IHashProvider } from './providers/hash.provider.interface';
import { ITokenProvider } from './providers/token.provider.interface';

describe('AuthService', () => {
  let service: AuthService;

  const mockRepository: jest.Mocked<IAuthRepository> = {
    findUserByEmailAndUsername: jest.fn(),
    create: jest.fn(),
    findUserByEmail: jest.fn(),
  };

  const mockHashProvider: jest.Mocked<IHashProvider> = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  const mockTokenProvider: jest.Mocked<ITokenProvider> = {
    sign: jest.fn(),
    verify: jest.fn(),
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

      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should create a new user when email and username are available', async () => {
      mockRepository.findUserByEmailAndUsername.mockResolvedValue(false);
      mockHashProvider.hash.mockResolvedValue('hashed-password');

      await service.register(userData);

      expect(mockHashProvider.hash).toHaveBeenCalledWith(userData.pass);

      expect(mockRepository.create).toHaveBeenCalledWith({
        email: userData.email,
        username: userData.username,
        passwordHash: 'hashed-password',
      });
    });

    it('should call repository.create only once', async () => {
      mockRepository.findUserByEmailAndUsername.mockResolvedValue(false);
      mockHashProvider.hash.mockResolvedValue('hashed-password');

      await service.register(userData);

      expect(mockRepository.create).toHaveBeenCalledTimes(1);
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

    it('should return access token when credentials are valid', async () => {
      mockRepository.findUserByEmail.mockResolvedValue(userFromDb as any);
      mockHashProvider.compare.mockResolvedValue(true);
      mockTokenProvider.sign.mockReturnValue('access-token');

      const result = await service.login(loginData);

      expect(mockTokenProvider.sign).toHaveBeenCalledWith(
        { sub: userFromDb.id },
        'access',
      );

      expect(result).toEqual({
        accessToken: 'access-token',
      });
    });

    it('should call tokenProvider.sign only once', async () => {
      mockRepository.findUserByEmail.mockResolvedValue(userFromDb as any);
      mockHashProvider.compare.mockResolvedValue(true);
      mockTokenProvider.sign.mockReturnValue('access-token');

      await service.login(loginData);

      expect(mockTokenProvider.sign).toHaveBeenCalledTimes(1);
    });
  });
});
