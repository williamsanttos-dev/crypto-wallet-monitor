/* eslint-disable nestjs-security/require-guards */

// False positive:
// Auth is enforced globally via APP_GUARD.
// Routes are private by default, and only endpoints explicitly marked with @Public() bypass authentication.

import {
  Controller,
  DefaultValuePipe,
  ForbiddenException,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import type { IUsersService } from './interfaces/users.service.interface';
import { UserEntity } from './entities/user.entity';
import { Roles } from 'src/security/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { CurrentUser } from 'src/security/decorators/current-user.decorator';
import type { AuthUser } from 'src/security/strategies/jwt.strategy';

@Controller('users')
export class UsersController {
  constructor(
    @Inject('UsersService')
    private readonly usersService: IUsersService,
  ) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'List users',
    description: 'Returns a paginated list of users.',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    example: 0,
    description: 'Number of users to skip before starting the result set.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 20,
    description: 'Maximum number of users returned in the response.',
  })
  @ApiOkResponse({
    description: 'Users returned successfully.',
    type: UserEntity,
    isArray: true,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized.',
  })
  async findAll(
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return await this.usersService.findAll(offset, limit);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Get(':id')
  @ApiOperation({
    summary: 'Find user by id',
    description: 'Returns the first user found for the provided id.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    example: '2d4d9b58-0d89-4f6a-b7f6-3f6ef1f26f1d', // eslint-disable-line secure-coding/no-hardcoded-credentials
    description: 'User identifier.',
  })
  @ApiOkResponse({
    description: 'User returned successfully.',
    type: UserEntity,
  })
  @ApiForbiddenResponse({
    description: 'Forbidden.',
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized.',
  })
  async find(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    this.validateUserAccess(user, id);

    return await this.usersService.find(id);
  }

  private validateUserAccess(user: AuthUser, id: string): void {
    const isAdmin = user.role === Role.ADMIN;
    const isSameUser = user.userId === id;

    if (!isAdmin && !isSameUser) {
      throw new ForbiddenException('FORBIDDEN_RESOURCE');
    }
  }
}
