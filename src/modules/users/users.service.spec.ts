import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { UsersService } from './users.service';
import { IUserRepository } from './interfaces/user.repository.interface';
import { Role } from 'src/enums/role.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthUser } from 'src/security/strategies/jwt.strategy';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserRepository: jest.Mocked<IUserRepository> = {
    findAll: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    userIsActive: jest.fn(),
  };

  const adminUser: AuthUser = {
    userId: 'admin-id',
    role: Role.ADMIN,
  };

  const activeRegularUser: AuthUser = {
    userId: 'user-id-1',
    role: Role.USER,
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
          isActive: true,
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
    it('should allow admin to find any user without checking active status', async () => {
      const targetUserId = 'user-id-1';
      const user = {
        id: targetUserId,
        email: 'admin@email.com',
        username: 'admin',
        role: Role.ADMIN,
        isActive: true,
        createdAt: new Date('2026-03-01T10:00:00.000Z'),
        updatedAt: new Date('2026-03-02T10:00:00.000Z'),
      };

      mockUserRepository.find.mockResolvedValue(user);

      await expect(service.find(adminUser, targetUserId)).resolves.toEqual(
        user,
      );
      expect(mockUserRepository.userIsActive).not.toHaveBeenCalled();
      expect(mockUserRepository.find).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.find).toHaveBeenCalledWith(targetUserId);
    });

    it('should allow active user to find their own resource', async () => {
      const user = {
        id: activeRegularUser.userId,
        email: 'user@email.com',
        username: 'user',
        role: Role.USER,
        isActive: true,
        createdAt: new Date('2026-03-01T10:00:00.000Z'),
        updatedAt: new Date('2026-03-02T10:00:00.000Z'),
      };

      mockUserRepository.userIsActive.mockResolvedValue(true);
      mockUserRepository.find.mockResolvedValue(user);

      await expect(
        service.find(activeRegularUser, activeRegularUser.userId),
      ).resolves.toEqual(user);
      expect(mockUserRepository.userIsActive).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.userIsActive).toHaveBeenCalledWith(
        activeRegularUser.userId,
      );
      expect(mockUserRepository.find).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.find).toHaveBeenCalledWith(
        activeRegularUser.userId,
      );
    });

    it('should throw forbidden when regular user tries to access another user resource', async () => {
      await expect(
        service.find(activeRegularUser, 'another-user-id'),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(mockUserRepository.userIsActive).not.toHaveBeenCalled();
      expect(mockUserRepository.find).not.toHaveBeenCalled();
    });

    it('should throw forbidden when authenticated user is inactive', async () => {
      mockUserRepository.userIsActive.mockResolvedValue(false);

      await expect(
        service.find(activeRegularUser, activeRegularUser.userId),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(mockUserRepository.userIsActive).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.userIsActive).toHaveBeenCalledWith(
        activeRegularUser.userId,
      );
      expect(mockUserRepository.find).not.toHaveBeenCalled();
    });

    it('should throw not found when repository does not return a user', async () => {
      mockUserRepository.userIsActive.mockResolvedValue(true);
      mockUserRepository.find.mockResolvedValue(null);

      await expect(
        service.find(activeRegularUser, activeRegularUser.userId),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(mockUserRepository.find).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.find).toHaveBeenCalledWith(
        activeRegularUser.userId,
      );
    });
  });

  describe('update', () => {
    const data: UpdateUserDto = {
      username: 'new-username',
    };

    it('should allow admin to update any user without checking active status', async () => {
      const targetUserId = 'user-id-1';
      const user = {
        id: targetUserId,
        email: 'admin@email.com',
        username: data.username,
        role: Role.ADMIN,
        isActive: true,
        createdAt: new Date('2026-03-01T10:00:00.000Z'),
        updatedAt: new Date('2026-03-02T10:00:00.000Z'),
      };

      mockUserRepository.update.mockResolvedValue(user);

      await expect(
        service.update(adminUser, targetUserId, data),
      ).resolves.toEqual(user);

      expect(mockUserRepository.userIsActive).not.toHaveBeenCalled();
      expect(mockUserRepository.update).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        targetUserId,
        data,
      );
    });

    it('should allow active user to update their own resource', async () => {
      const user = {
        id: activeRegularUser.userId,
        email: 'user@email.com',
        username: data.username,
        role: Role.USER,
        isActive: true,
        createdAt: new Date('2026-03-01T10:00:00.000Z'),
        updatedAt: new Date('2026-03-02T10:00:00.000Z'),
      };

      mockUserRepository.userIsActive.mockResolvedValue(true);
      mockUserRepository.update.mockResolvedValue(user);

      await expect(
        service.update(activeRegularUser, activeRegularUser.userId, data),
      ).resolves.toEqual(user);

      expect(mockUserRepository.userIsActive).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.userIsActive).toHaveBeenCalledWith(
        activeRegularUser.userId,
      );
      expect(mockUserRepository.update).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        activeRegularUser.userId,
        data,
      );
    });

    it('should throw forbidden when regular user tries to update another user resource', async () => {
      await expect(
        service.update(activeRegularUser, 'another-user-id', data),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(mockUserRepository.userIsActive).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should throw forbidden when authenticated user is inactive', async () => {
      mockUserRepository.userIsActive.mockResolvedValue(false);

      await expect(
        service.update(activeRegularUser, activeRegularUser.userId, data),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(mockUserRepository.userIsActive).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.userIsActive).toHaveBeenCalledWith(
        activeRegularUser.userId,
      );
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should throw not found when repository does not update a user', async () => {
      mockUserRepository.userIsActive.mockResolvedValue(true);
      mockUserRepository.update.mockResolvedValue(null);

      await expect(
        service.update(activeRegularUser, activeRegularUser.userId, data),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(mockUserRepository.update).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        activeRegularUser.userId,
        data,
      );
    });

    it('should throw conflict when repository returns unique constraint error', async () => {
      const prismaError = {
        code: 'P2002',
      };

      mockUserRepository.userIsActive.mockResolvedValue(true);
      mockUserRepository.update.mockRejectedValue(prismaError);

      await expect(
        service.update(activeRegularUser, activeRegularUser.userId, data),
      ).rejects.toBeInstanceOf(ConflictException);

      expect(mockUserRepository.update).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        activeRegularUser.userId,
        data,
      );
    });
  });
});
