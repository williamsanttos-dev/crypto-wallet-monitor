-- CreateEnum
CREATE TYPE "WalletSyncStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "wallet_states" (
    "id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "current_balance_wei" DECIMAL(78,0) NOT NULL DEFAULT 0,
    "last_balance_updated_at" TIMESTAMP(3),
    "last_synced_at" TIMESTAMP(3),
    "last_synced_block_number" BIGINT,
    "last_sync_status" "WalletSyncStatus" NOT NULL DEFAULT 'PENDING',
    "last_sync_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallet_states_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wallet_states_wallet_id_key" ON "wallet_states"("wallet_id");

-- CreateIndex
CREATE INDEX "wallet_state_last_sync_status_idx" ON "wallet_states"("last_sync_status");

-- CreateIndex
CREATE INDEX "wallet_state_last_synced_block_number_idx" ON "wallet_states"("last_synced_block_number");

-- CreateIndex
CREATE INDEX "wallet_user_id_idx" ON "wallets"("user_id");

-- CreateIndex
CREATE INDEX "wallet_address_idx" ON "wallets"("address");

-- AddForeignKey
ALTER TABLE "wallet_states" ADD CONSTRAINT "wallet_states_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "wallets_user_id_address_key" RENAME TO "wallet_user_id_address_key";
