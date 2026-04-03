/*
  Warnings:

  - You are about to alter the column `address` on the `wallets` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(42)`.

*/
-- CreateEnum
CREATE TYPE "WalletTransactionDirection" AS ENUM ('IN', 'OUT', 'SELF');

-- CreateEnum
CREATE TYPE "WalletTransactionStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED');

-- AlterTable
ALTER TABLE "wallets" ALTER COLUMN "address" SET DATA TYPE VARCHAR(42);

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "hash" VARCHAR(66) NOT NULL,
    "nonce" BIGINT,
    "block_number" BIGINT,
    "block_hash" VARCHAR(66),
    "transaction_index" INTEGER,
    "from_address" VARCHAR(42) NOT NULL,
    "to_address" VARCHAR(42),
    "value_wei" DECIMAL(78,0) NOT NULL,
    "gas_price_wei" DECIMAL(78,0),
    "gas_used" DECIMAL(78,0),
    "fee_wei" DECIMAL(78,0),
    "status" "WalletTransactionStatus" NOT NULL DEFAULT 'PENDING',
    "direction" "WalletTransactionDirection" NOT NULL,
    "timestamp" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "wallet_transaction_wallet_id_block_number_idx" ON "wallet_transactions"("wallet_id", "block_number");

-- CreateIndex
CREATE INDEX "wallet_transaction_wallet_id_timestamp_idx" ON "wallet_transactions"("wallet_id", "timestamp");

-- CreateIndex
CREATE INDEX "wallet_transaction_hash_idx" ON "wallet_transactions"("hash");

-- CreateIndex
CREATE INDEX "wallet_transaction_from_address_idx" ON "wallet_transactions"("from_address");

-- CreateIndex
CREATE INDEX "wallet_transaction_to_address_idx" ON "wallet_transactions"("to_address");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_transaction_wallet_id_hash_key" ON "wallet_transactions"("wallet_id", "hash");

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
