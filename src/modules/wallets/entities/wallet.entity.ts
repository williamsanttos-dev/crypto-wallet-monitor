/* eslint-disable secure-coding/no-hardcoded-credentials */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WalletEntity {
  @ApiProperty({
    description: 'Wallet unique identifier',
    example: 'd9e0d1f5-6306-4eb6-a3b2-0f26adf81e11',
  })
  id!: string;

  @ApiProperty({
    description: 'Owner user identifier',
    example: '2d4d9b58-0d89-4f6a-b7f6-3f6ef1f26f1d',
  })
  userId!: string;

  @ApiProperty({
    description: 'Wallet address in checksum format',
    example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  })
  address!: string;

  @ApiPropertyOptional({
    description: 'Wallet display label',
    example: 'Main wallet',
  })
  label?: string | null;

  @ApiProperty({
    description: 'Indicates whether the wallet is active',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'Date when the wallet was created',
    example: '2026-03-01T10:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Date when the wallet was last updated',
    example: '2026-03-02T10:00:00.000Z',
  })
  updatedAt!: Date;
}
