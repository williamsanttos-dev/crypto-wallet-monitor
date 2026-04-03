-- CreateEnum
CREATE TYPE "WalletNetwork" AS ENUM ('ETHEREUM');

-- AlterTable
ALTER TABLE "wallets" ADD COLUMN     "network" "WalletNetwork" NOT NULL DEFAULT 'ETHEREUM';
