import { CreateWalletDto } from '../dto/create-wallet.dto';
import { WalletEntity } from '../entities/wallet.entity';
import { AuthUser } from 'src/security/strategies/jwt.strategy';

export interface IWalletsService {
  findAll(
    authUser: AuthUser,
    offset: number,
    limit: number,
  ): Promise<WalletEntity[]>;
  create(authUser: AuthUser, data: CreateWalletDto): Promise<WalletEntity>;
}
