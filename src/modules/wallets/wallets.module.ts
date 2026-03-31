import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';
import { WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';
import { PrismaWalletRepository } from './wallets.repository';

@Module({
  imports: [PrismaModule],
  controllers: [WalletsController],
  providers: [
    { provide: 'WalletsService', useClass: WalletsService },
    { provide: 'WalletRepository', useClass: PrismaWalletRepository },
  ],
})
export class WalletsModule {}
