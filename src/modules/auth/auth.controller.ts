/* eslint-disable nestjs-security/no-missing-validation-pipe*/
// ValidationPipe exist in main.ts
// all dto goes through class-validator lib

import { Body, Controller, Inject, Post, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';

import { CreateUserDto } from './dto/create-user.dto';
import type { IAuthService } from './interfaces/auth.service.interface';
import { Public } from 'src/security/decorators/public.decorator';
import { LoginDto } from './dto/login.dto';

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

    response.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60,
    });
  }
}
