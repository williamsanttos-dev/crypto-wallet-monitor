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
} from '@nestjs/swagger';
import type { Response, Request } from 'express';

import { CreateUserDto } from './dto/create-user.dto';
import type { IAuthService } from './interfaces/auth.service.interface';
import { Public } from 'src/security/decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { AuthCookies } from 'src/security/strategies/jwt.strategy';
import { EXPIRE_ACCESS, EXPIRE_REFRESH } from './const/expire-tokens';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AuthService')
    private readonly service: IAuthService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  @ApiCreatedResponse({
    description: 'The user has been successfully created',
  })
  @ApiConflictResponse({
    description: 'Conflict',
  })
  async register(@Body() data: CreateUserDto) {
    return await this.service.register(data);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    description: 'Login Successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid Credentials',
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
}
