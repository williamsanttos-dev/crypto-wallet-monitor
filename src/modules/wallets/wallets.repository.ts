import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import type { IWalletRepository } from './interfaces/wallet.repository.interface';
import type { WalletEntity } from './entities/wallet.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';

@Injectable()
export class PrismaWalletRepository implements IWalletRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: CreateWalletDto): Promise<WalletEntity> {
    return await this.prisma.wallet.create({
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
