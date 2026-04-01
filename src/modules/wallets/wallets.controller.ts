/* eslint-disable nestjs-security/require-guards */
/* eslint-disable secure-coding/no-hardcoded-credentials */
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
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
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
import { UpdateWalletDto } from './dto/update-wallet.dto';

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
  @Get(':id')
  @Roles(Role.USER)
  @ApiOperation({
    summary: 'Find wallet by id',
    description:
      'Returns the active wallet linked to the currently authenticated user for the provided id.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    example: 'd9e0d1f5-6306-4eb6-a3b2-0f26adf81e11',
    description: 'Wallet identifier.',
  })
  @ApiOkResponse({
    description: 'Wallet returned successfully.',
    type: WalletEntity,
  })
  @ApiForbiddenResponse({
    description: 'Forbidden.',
  })
  @ApiNotFoundResponse({
    description: 'Wallet not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized.',
  })
  async find(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return await this.walletsService.find(user, id);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Delete(':id')
  @Roles(Role.USER)
  @ApiOperation({
    summary: 'Delete wallet by id',
    description:
      'Soft deletes the active wallet linked to the currently authenticated user for the provided id.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    example: 'd9e0d1f5-6306-4eb6-a3b2-0f26adf81e11',
    description: 'Wallet identifier.',
  })
  @ApiOkResponse({
    description: 'Wallet deleted successfully.',
    type: WalletEntity,
  })
  @ApiForbiddenResponse({
    description: 'Forbidden.',
  })
  @ApiNotFoundResponse({
    description: 'Wallet not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized.',
  })
  async delete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return await this.walletsService.delete(user, id);
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

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Patch(':id')
  @Roles(Role.USER)
  @ApiOperation({
    summary: 'Update wallet by id',
    description:
      'Updates only the label of the active wallet linked to the currently authenticated user for the provided id.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    example: 'd9e0d1f5-6306-4eb6-a3b2-0f26adf81e11',
    description: 'Wallet identifier.',
  })
  @ApiOkResponse({
    description: 'Wallet updated successfully.',
    type: WalletEntity,
  })
  @ApiForbiddenResponse({
    description: 'Forbidden.',
  })
  @ApiNotFoundResponse({
    description: 'Wallet not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateWalletDto: UpdateWalletDto,
    @CurrentUser() user: AuthUser,
  ) {
    return await this.walletsService.update(user, id, updateWalletDto);
  }
}
