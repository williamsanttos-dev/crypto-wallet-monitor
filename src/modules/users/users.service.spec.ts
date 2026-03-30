import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { UsersService } from './users.service';
import { IUserRepository } from './interfaces/user.repository.interface';
import { Role } from 'src/enums/role.enum';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserRepository: jest.Mocked<IUserRepository> = {
    findAll: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: 'UserRepository',
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users from repository', async () => {
      const offset = 0;
      const limit = 20;
      const users = [
        {
          id: 'user-id-1',
          email: 'admin@email.com',
          username: 'admin',
          role: Role.ADMIN,
          createdAt: new Date('2026-03-01T10:00:00.000Z'),
          updatedAt: new Date('2026-03-02T10:00:00.000Z'),
        },
      ];

      mockUserRepository.findAll.mockResolvedValue(users);

      await expect(service.findAll(offset, limit)).resolves.toEqual(users);
      expect(mockUserRepository.findAll).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.findAll).toHaveBeenCalledWith(offset, limit);
    });
  });
  describe('find', () => {
    it('should return user by id from repository', async () => {
      const userId = 'user-id-1';
      const user = {
        id: userId,
        email: 'admin@email.com',
        username: 'admin',
        role: Role.ADMIN,
        createdAt: new Date('2026-03-01T10:00:00.000Z'),
        updatedAt: new Date('2026-03-02T10:00:00.000Z'),
      };

      mockUserRepository.find.mockResolvedValue(user);

      await expect(service.find(userId)).resolves.toEqual(user);
      expect(mockUserRepository.find).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.find).toHaveBeenCalledWith(userId);
    });

    it('should throw not found when repository does not return a user', async () => {
      const userId = 'missing-user-id';

      mockUserRepository.find.mockResolvedValue(null);

      await expect(service.find(userId)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(mockUserRepository.find).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.find).toHaveBeenCalledWith(userId);
    });
  });
});
