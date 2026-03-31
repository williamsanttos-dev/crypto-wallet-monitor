import { ConflictException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { WalletsService } from './wallets.service';
import { IWalletRepository } from './interfaces/wallet.repository.interface';
import { AuthUser } from 'src/security/strategies/jwt.strategy';
import { Role } from 'src/enums/role.enum';
import { CreateWalletDto } from './dto/create-wallet.dto';

describe('WalletsService', () => {
  let service: WalletsService;

  const mockWalletRepository: jest.Mocked<IWalletRepository> = {
    findAll: jest.fn(),
    create: jest.fn(),
    userIsActive: jest.fn(),
  };

  const activeRegularUser: AuthUser = {
    userId: 'user-id-1',
    role: Role.USER,
  };

  const adminUser: AuthUser = {
    userId: 'admin-id',
    role: Role.ADMIN,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletsService,
        {
          provide: 'WalletRepository',
          useValue: mockWalletRepository,
        },
      ],
    }).compile();

    service = module.get<WalletsService>(WalletsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return active wallets from authenticated active user with pagination', async () => {
      const offset = 0;
      const limit = 20;
      const wallets = [
        {
          id: 'wallet-id-1',
          userId: activeRegularUser.userId,
          address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          label: 'Main wallet',
          isActive: true,
          createdAt: new Date('2026-03-01T10:00:00.000Z'),
          updatedAt: new Date('2026-03-02T10:00:00.000Z'),
        },
      ];

      mockWalletRepository.userIsActive.mockResolvedValue(true);
      mockWalletRepository.findAll.mockResolvedValue(wallets);

      await expect(
        service.findAll(activeRegularUser, offset, limit),
      ).resolves.toEqual(wallets);

      expect(mockWalletRepository.userIsActive).toHaveBeenCalledTimes(1);
      expect(mockWalletRepository.userIsActive).toHaveBeenCalledWith(
        activeRegularUser.userId,
      );
      expect(mockWalletRepository.findAll).toHaveBeenCalledTimes(1);
      expect(mockWalletRepository.findAll).toHaveBeenCalledWith(
        activeRegularUser.userId,
        offset,
        limit,
      );
    });

    it('should throw forbidden when authenticated user is inactive', async () => {
      mockWalletRepository.userIsActive.mockResolvedValue(false);

      await expect(
        service.findAll(activeRegularUser, 0, 20),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(mockWalletRepository.userIsActive).toHaveBeenCalledTimes(1);
      expect(mockWalletRepository.userIsActive).toHaveBeenCalledWith(
        activeRegularUser.userId,
      );
      expect(mockWalletRepository.findAll).not.toHaveBeenCalled();
    });

    it('should throw forbidden when authenticated user is not a regular user', async () => {
      await expect(service.findAll(adminUser, 0, 20)).rejects.toBeInstanceOf(
        ForbiddenException,
      );

      expect(mockWalletRepository.userIsActive).not.toHaveBeenCalled();
      expect(mockWalletRepository.findAll).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    const data: CreateWalletDto = {
      address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      label: 'Main wallet',
    };

    it('should create wallet for active regular user', async () => {
      const wallet = {
        id: 'wallet-id-1',
        userId: activeRegularUser.userId,
        address: data.address,
        label: data.label,
        isActive: true,
        createdAt: new Date('2026-03-01T10:00:00.000Z'),
        updatedAt: new Date('2026-03-02T10:00:00.000Z'),
      };

      mockWalletRepository.userIsActive.mockResolvedValue(true);
      mockWalletRepository.create.mockResolvedValue(wallet);

      await expect(service.create(activeRegularUser, data)).resolves.toEqual(
        wallet,
      );

      expect(mockWalletRepository.userIsActive).toHaveBeenCalledTimes(1);
      expect(mockWalletRepository.userIsActive).toHaveBeenCalledWith(
        activeRegularUser.userId,
      );
      expect(mockWalletRepository.create).toHaveBeenCalledTimes(1);
      expect(mockWalletRepository.create).toHaveBeenCalledWith(
        activeRegularUser.userId,
        data,
      );
    });

    it('should throw forbidden when authenticated user is inactive', async () => {
      mockWalletRepository.userIsActive.mockResolvedValue(false);

      await expect(
        service.create(activeRegularUser, data),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(mockWalletRepository.userIsActive).toHaveBeenCalledTimes(1);
      expect(mockWalletRepository.userIsActive).toHaveBeenCalledWith(
        activeRegularUser.userId,
      );
      expect(mockWalletRepository.create).not.toHaveBeenCalled();
    });

    it('should throw forbidden when authenticated user is not a regular user', async () => {
      await expect(service.create(adminUser, data)).rejects.toBeInstanceOf(
        ForbiddenException,
      );

      expect(mockWalletRepository.userIsActive).not.toHaveBeenCalled();
      expect(mockWalletRepository.create).not.toHaveBeenCalled();
    });

    it('should throw conflict when repository returns prisma unique constraint error', async () => {
      mockWalletRepository.userIsActive.mockResolvedValue(true);
      mockWalletRepository.create.mockRejectedValue({
        code: 'P2002',
      });

      await expect(
        service.create(activeRegularUser, data),
      ).rejects.toBeInstanceOf(ConflictException);

      expect(mockWalletRepository.userIsActive).toHaveBeenCalledTimes(1);
      expect(mockWalletRepository.userIsActive).toHaveBeenCalledWith(
        activeRegularUser.userId,
      );
      expect(mockWalletRepository.create).toHaveBeenCalledTimes(1);
      expect(mockWalletRepository.create).toHaveBeenCalledWith(
        activeRegularUser.userId,
        data,
      );
    });
  });
});
