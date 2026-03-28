/* eslint-disable nestjs-security/require-guards */

// False positive:
// Auth is enforced globally via APP_GUARD.
// Routes are private by default, and only endpoints explicitly marked with @Public() bypass authentication.

import {
  Controller,
  DefaultValuePipe,
  Get,
  Inject,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import type { IUsersService } from './interfaces/users.service.interface';
import { UserEntity } from './entities/user.entity';
import { Roles } from 'src/security/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';

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
}
