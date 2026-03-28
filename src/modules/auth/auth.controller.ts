/* eslint-disable nestjs-security/no-missing-validation-pipe*/
// ValidationPipe exist in main.ts
// all dto goes through class-validator lib

import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response, Request } from 'express';

import { CreateUserDto } from './dto/create-user.dto';
import type { IAuthService } from './interfaces/auth.service.interface';
import { Public } from 'src/security/decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { AuthCookies } from 'src/security/strategies/jwt.strategy';
import { EXPIRE_ACCESS, EXPIRE_REFRESH } from './const/expire-tokens';
import { CurrentUser } from 'src/security/decorators/current-user.decorator';
import { Roles } from 'src/security/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AuthService')
    private readonly service: IAuthService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account.',
  })
  @ApiCreatedResponse({
    description: 'The user has been successfully created.',
  })
  @ApiConflictResponse({
    description: 'A user with the same email or username already exists.',
  })
  async register(@Body() data: CreateUserDto) {
    return await this.service.register(data);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Authenticate a user',
    description:
      'Authenticates the user and sets the access and refresh tokens in HTTP-only cookies.',
  })
  @ApiOkResponse({
    description:
      'Login completed successfully and authentication cookies were set.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid credentials.',
  })
  async login(
    @Body() data: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.service.login(data);

    response
      .cookie('access_token', tokens.accessToken, {
        httpOnly: true,
        secure: false, // true in production
        sameSite: 'lax',
        path: '/',
        maxAge: EXPIRE_ACCESS,
      })
      .cookie('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: false, // true in production
        sameSite: 'lax',
        path: '/',
        maxAge: EXPIRE_REFRESH,
      });
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh authentication tokens',
    description:
      'Reads the refresh token from cookies, issues new tokens, and replaces the authentication cookies.',
  })
  @ApiCookieAuth('refresh_token')
  @ApiOkResponse({
    description:
      'Tokens were refreshed successfully and new authentication cookies were set.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid refresh token.',
  })
  @ApiUnauthorizedResponse({
    description: 'Refresh token cookie not found.',
  })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refresh = (request.cookies as AuthCookies)?.refresh_token;

    if (!refresh) throw new UnauthorizedException('TOKEN_NOT_FOUND');

    const { accessToken, refreshToken } = await this.service.refresh(refresh);

    response
      .cookie('access_token', accessToken, {
        httpOnly: true,
        secure: false, // true in production
        sameSite: 'lax',
        path: '/',
        maxAge: EXPIRE_ACCESS,
      })
      .cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: false, // true in production
        sameSite: 'lax',
        path: '/',
        maxAge: EXPIRE_REFRESH,
      });
  }

  // False positive:
  // Auth is enforced globally via APP_GUARD.
  // Routes are private by default, and only endpoints explicitly marked with @Public() bypass authentication.
  // eslint-disable-next-line nestjs-security/require-guards
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  @Roles(Role.ADMIN, Role.USER)
  @ApiOperation({
    summary: 'Logout the current user',
    description:
      'Invalidates the current refresh token and clears the authentication cookies.',
  })
  @ApiCookieAuth('access_token')
  @ApiOkResponse({
    description:
      'Logout completed successfully and authentication cookies were cleared.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized.',
  })
  async logout(
    @CurrentUser() user: { userId?: string } | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (!user?.userId) throw new UnauthorizedException('INVALID_USER_ID');

    await this.service.logout(user.userId);

    response
      .cookie('access_token', 'null', {
        httpOnly: true,
        secure: false, // true in production
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      })
      .cookie('refresh_token', 'null', {
        httpOnly: true,
        secure: false, // true in production
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });
  }
}
