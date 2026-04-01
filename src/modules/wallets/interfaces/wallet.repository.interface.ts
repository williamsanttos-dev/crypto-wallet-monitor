import { CreateWalletDto } from '../dto/create-wallet.dto';
import { UpdateWalletDto } from '../dto/update-wallet.dto';
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
  update(
    userId: string,
    id: string,
    data: UpdateWalletDto,
  ): Promise<WalletEntity | null>;
  userIsActive(id: string): Promise<boolean>;
}
