import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaRepository } from './auth.repository';
import { BcryptHashProvider } from './providers/hash.provider';
import { JwtTokenProvider } from './providers/token.provider';
import { JwtStrategy } from 'src/security/strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [ConfigModule, PassportModule],
  controllers: [AuthController],
  providers: [
    { provide: 'AuthService', useClass: AuthService },
    { provide: 'AuthRepository', useClass: PrismaRepository },
    { provide: 'HashProvider', useClass: BcryptHashProvider },
    {
      provide: 'TokenProvider',
      useClass: JwtTokenProvider,
    },
    JwtStrategy,
  ],
})
export class AuthModule {}
