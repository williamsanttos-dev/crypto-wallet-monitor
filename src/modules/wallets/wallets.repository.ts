import { ConflictException, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import type { IWalletRepository } from './interfaces/wallet.repository.interface';
import type { WalletEntity } from './entities/wallet.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';

@Injectable()
export class PrismaWalletRepository implements IWalletRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    userId: string,
    offset: number,
    limit: number,
  ): Promise<WalletEntity[]> {
    return await this.prisma.wallet.findMany({
      where: {
        userId,
        isActive: true,
      },
      skip: offset,
      take: limit,
      select: {
        id: true,
        userId: true,
        address: true,
        label: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async find(userId: string, id: string): Promise<WalletEntity | null> {
    return await this.prisma.wallet.findFirst({
      where: {
        id,
        userId,
        isActive: true,
      },
      select: {
        id: true,
        userId: true,
        address: true,
        label: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async delete(userId: string, id: string): Promise<WalletEntity | null> {
    return await this.prisma.wallet.update({
      where: {
        id,
        userId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
      select: {
        id: true,
        userId: true,
        address: true,
        label: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async create(userId: string, data: CreateWalletDto): Promise<WalletEntity> {
    return await this.prisma.$transaction(async (tx) => {
      const existingWallet = await tx.wallet.findUnique({
        where: {
          userId_address: {
            address: data.address,
            userId,
          },
        },
        select: {
          id: true,
          isActive: true,
        },
      });

      if (!existingWallet)
        return await tx.wallet.create({
          data: {
            userId,
            address: data.address,
            label: data.label,
          },
          select: {
            id: true,
            userId: true,
            address: true,
            label: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        });

      if (existingWallet.isActive)
        throw new ConflictException('WALLET_ALREADY_REGISTERED');

      return tx.wallet.update({
        where: {
          userId_address: {
            userId,
            address: data.address,
          },
        },
        data: {
          label: data.label,
          isActive: true,
        },
        select: {
          id: true,
          userId: true,
          address: true,
          label: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });
  }

  async userIsActive(id: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    return user ? true : false;
  }
}
