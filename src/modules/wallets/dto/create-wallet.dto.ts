/* eslint-disable secure-coding/no-hardcoded-credentials */

import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  Length,
  ValidateBy,
  ValidationOptions,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { getAddress } from 'ethers';

type ValueInput = {
  value: unknown;
};

function normalizeString({ value }: ValueInput): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

function IsChecksumAddress(validationOptions?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'isChecksumAddress',
      validator: {
        validate: (value: unknown): boolean => {
          if (typeof value !== 'string' || value.trim().length === 0) {
            return false;
          }

          try {
            return getAddress(value) === value;
          } catch {
            return false;
          }
        },
        defaultMessage: () =>
          'address must be a valid Ethereum address in checksum format',
      },
    },
    validationOptions,
  );
}

export class CreateWalletDto {
  @IsString()
  @Transform(normalizeString)
  @IsChecksumAddress()
  @ApiProperty({
    description: 'Wallet address in checksum format',
    example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  })
  address: string;

  @IsOptional()
  @IsString()
  @Transform(normalizeString)
  @Length(1, 100)
  @ApiPropertyOptional({
    description: 'Optional wallet label',
    example: 'Main wallet',
  })
  label?: string;
}
