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

import type { IUsersService } from './interfaces/users.service.interface';
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
  async findAll(
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return await this.usersService.findAll(offset, limit);
  }
}
