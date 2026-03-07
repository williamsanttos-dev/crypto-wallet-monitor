import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';

import { AuthService } from './auth.service';
import { IAuthRepository } from './interfaces/auth.repository.interface';
import { IHashProvider } from './providers/hash.provider.interface';

describe('AuthService', () => {
  let service: AuthService;

  const mockRepository: jest.Mocked<IAuthRepository> = {
    findUserByEmailAndUsername: jest.fn(),
    create: jest.fn(),
  };

  const mockHashProvider: jest.Mocked<IHashProvider> = {
    hash: jest.fn(),
    compare: jest.fn(),
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
});
