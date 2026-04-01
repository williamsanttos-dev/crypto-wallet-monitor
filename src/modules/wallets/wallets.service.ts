/* eslint-disable secure-coding/no-insecure-comparison */

import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { IWalletRepository } from './interfaces/wallet.repository.interface';
import type { IWalletsService } from './interfaces/wallets.service.interface';
import { WalletEntity } from './entities/wallet.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { AuthUser } from 'src/security/strategies/jwt.strategy';
import { Role } from 'src/enums/role.enum';

@Injectable()
export class WalletsService implements IWalletsService {
  constructor(
    @Inject('WalletRepository')
    private readonly repository: IWalletRepository,
  ) {}

  async findAll(
    authUser: AuthUser,
    offset: number,
    limit: number,
  ): Promise<WalletEntity[]> {
    await this.ensureAuthenticatedUserCanOperate(authUser);

    return await this.repository.findAll(authUser.userId, offset, limit);
  }

  async find(authUser: AuthUser, id: string): Promise<WalletEntity> {
    await this.ensureAuthenticatedUserCanOperate(authUser);

    const wallet = await this.repository.find(authUser.userId, id);

    if (!wallet) {
      throw new NotFoundException('WALLET_NOT_FOUND');
    }

    return wallet;
  }

  async delete(authUser: AuthUser, id: string): Promise<WalletEntity> {
    await this.ensureAuthenticatedUserCanOperate(authUser);

    const wallet = await this.repository.delete(authUser.userId, id);

    if (!wallet) {
      throw new NotFoundException('WALLET_NOT_FOUND');
    }

    return wallet;
  }

  async create(
    authUser: AuthUser,
    data: CreateWalletDto,
  ): Promise<WalletEntity> {
    await this.ensureAuthenticatedUserCanOperate(authUser);
    return await this.repository.create(authUser.userId, data);
  }

  private async ensureAuthenticatedUserCanOperate(
    authUser: AuthUser,
  ): Promise<void> {
    if (authUser.role !== Role.USER) {
      throw new ForbiddenException('FORBIDDEN_RESOURCE');
    }

    const isActive = await this.repository.userIsActive(authUser.userId);

    if (!isActive) {
      throw new ForbiddenException(
        'INACTIVE_USERS_CANNOT_ACCESS_THIS_RESOURCE', // eslint-disable-line secure-coding/no-hardcoded-credentials
      );
    }
  }
}
