/* eslint-disable nestjs-security/require-guards */
/* eslint-disable nestjs-security/no-missing-validation-pipe */

// ValidationPipe exist in main.ts
// all dto goes through class-validator lib

// False positive:
// Auth is enforced globally via APP_GUARD.
// Routes are private by default, and only endpoints explicitly marked with @Public() bypass authentication.

import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Inject,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import type { IWalletsService } from './interfaces/wallets.service.interface';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { WalletEntity } from './entities/wallet.entity';
import { Roles } from 'src/security/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { CurrentUser } from 'src/security/decorators/current-user.decorator';
import type { AuthUser } from 'src/security/strategies/jwt.strategy';

@ApiTags('wallets')
@Controller('wallets')
export class WalletsController {
  constructor(
    @Inject('WalletsService')
    private readonly walletsService: IWalletsService,
  ) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Get()
  @Roles(Role.USER)
  @ApiOperation({
    summary: 'List wallets',
    description:
      'Returns a paginated list of active wallets linked to the currently authenticated user.',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    example: 0,
    description: 'Number of wallets to skip before starting the result set.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 20,
    description: 'Maximum number of wallets returned in the response.',
  })
  @ApiOkResponse({
    description: 'Wallets returned successfully.',
    type: WalletEntity,
    isArray: true,
  })
  @ApiForbiddenResponse({
    description: 'Forbidden.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized.',
  })
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return await this.walletsService.findAll(user, offset, limit);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post()
  @Roles(Role.USER)
  @ApiOperation({
    summary: 'Register a wallet',
    description: 'Creates a wallet linked to the currently authenticated user.',
  })
  @ApiCreatedResponse({
    description: 'Wallet created successfully.',
    type: WalletEntity,
  })
  @ApiConflictResponse({
    description: 'Wallet address already registered for this user.',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized.',
  })
  async create(
    @Body() createWalletDto: CreateWalletDto,
    @CurrentUser() user: AuthUser,
  ) {
    return await this.walletsService.create(user, createWalletDto);
  }
}
