/* eslint-disable nestjs-security/require-guards */
/* eslint-disable secure-coding/no-hardcoded-credentials */

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
  Query,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiConflictResponse,
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
import { UpdateUserDto } from './dto/update-user.dto';

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
    example: '2d4d9b58-0d89-4f6a-b7f6-3f6ef1f26f1d',
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
    return await this.usersService.find(user, id);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Patch(':id')
  @ApiOperation({
    summary: 'Update user by id',
    description:
      'Updates the username of the user identified by the provided id.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    example: '2d4d9b58-0d89-4f6a-b7f6-3f6ef1f26f1d',
    description: 'User identifier.',
  })
  @ApiOkResponse({
    description: 'User updated successfully.',
    type: UserEntity,
  })
  @ApiConflictResponse({
    description: 'Username already in use.',
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
  async update(
    @Param('id') id: string,
    @Body() data: UpdateUserDto,
    @CurrentUser() user: AuthUser,
  ) {
    return await this.usersService.update(user, id, data);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete user by id',
    description:
      'Sets the user as inactive for the user identified by the provided id.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    example: '2d4d9b58-0d89-4f6a-b7f6-3f6ef1f26f1d',
    description: 'User identifier.',
  })
  @ApiOkResponse({
    description: 'User deleted successfully.',
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
  async delete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return await this.usersService.delete(user, id);
  }
}
