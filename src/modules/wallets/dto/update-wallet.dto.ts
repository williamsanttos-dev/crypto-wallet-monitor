import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, Length } from 'class-validator';

type ValueInput = {
  value: unknown;
};

function normalizeString({ value }: ValueInput): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class UpdateWalletDto {
  @IsOptional()
  @IsString()
  @Transform(normalizeString)
  @Length(1, 100)
  @ApiPropertyOptional({
    description: 'Optional wallet label',
    example: 'Trading wallet',
  })
  label?: string;
}
