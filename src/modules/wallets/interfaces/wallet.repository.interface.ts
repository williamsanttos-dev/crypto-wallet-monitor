import { CreateWalletDto } from '../dto/create-wallet.dto';
import { WalletEntity } from '../entities/wallet.entity';

export interface IWalletRepository {
  findAll(
    userId: string,
    offset: number,
    limit: number,
  ): Promise<WalletEntity[]>;
  find(userId: string, id: string): Promise<WalletEntity | null>;
  delete(userId: string, id: string): Promise<WalletEntity | null>;
  create(userId: string, data: CreateWalletDto): Promise<WalletEntity>;
  userIsActive(id: string): Promise<boolean>;
}
