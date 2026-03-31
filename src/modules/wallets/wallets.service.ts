/* eslint-disable secure-coding/no-insecure-comparison */

import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';

import type { IWalletRepository } from './interfaces/wallet.repository.interface';
import type { IWalletsService } from './interfaces/wallets.service.interface';
import { WalletEntity } from './entities/wallet.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { AuthUser } from 'src/security/strategies/jwt.strategy';
import { Role } from 'src/enums/role.enum';

type PrismaErrorWithCode = {
  code?: string;
};

@Injectable()
export class WalletsService implements IWalletsService {
  constructor(
    @Inject('WalletRepository')
    private readonly repository: IWalletRepository,
  ) {}

  async create(
    authUser: AuthUser,
    data: CreateWalletDto,
  ): Promise<WalletEntity> {
    try {
      await this.ensureAuthenticatedUserCanOperate(authUser);
      return await this.repository.create(authUser.userId, data);
    } catch (error) {
      if ((error as PrismaErrorWithCode).code === 'P2002') {
        throw new ConflictException('wallet address already registered');
      }

      throw error;
    }
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
