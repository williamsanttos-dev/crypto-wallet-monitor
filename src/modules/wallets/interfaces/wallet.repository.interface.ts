import { CreateWalletDto } from '../dto/create-wallet.dto';
import { WalletEntity } from '../entities/wallet.entity';

export interface IWalletRepository {
  create(userId: string, data: CreateWalletDto): Promise<WalletEntity>;
  userIsActive(id: string): Promise<boolean>;
}
