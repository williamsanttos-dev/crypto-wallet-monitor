import { Body, Controller, Inject, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { CreateUserDto } from './dto/create-user.dto';
import type { IAuthService } from './interfaces/auth.service.interface';
import { Public } from 'src/security/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AuthService')
    private readonly service: IAuthService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  async register(
    // ValidationPipe in main.ts
    // eslint-disable-next-line nestjs-security/no-missing-validation-pipe
    @Body() data: CreateUserDto,
  ) {
    return await this.service.register(data);
  }
}
