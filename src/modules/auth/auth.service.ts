/* eslint-disable jwt/require-expiration, jwt/no-weak-secret, jwt/no-hardcoded-secret */
// All requirements was added in TokenProvider file (src/modules/auth/provider/token.provider.ts)

import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';

import {
  IAuthService,
  TokensPayload,
} from './interfaces/auth.service.interface';
import type { IAuthRepository } from './interfaces/auth.repository.interface';
import type { IHashProvider } from './providers/hash.provider.interface';
import type {
  ITokenProvider,
  JwtPayload,
} from './providers/token.provider.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject('AuthRepository')
    private readonly repository: IAuthRepository,

    @Inject('HashProvider')
    private readonly hashProvider: IHashProvider,

    @Inject('TokenProvider')
    private readonly tokenProvider: ITokenProvider,

    private readonly prisma: PrismaService,
  ) {}

  async register(data: CreateUserDto): Promise<void> {
    const userAlreadyExist = await this.repository.findUserByEmailAndUsername(
      data.email,
      data.username,
    );

    if (userAlreadyExist)
      throw new ConflictException('email or username already exist');

    const passwordHash = await this.hashProvider.hash(data.pass);

    await this.repository.registerUser({
      email: data.email,
      passwordHash,
      username: data.username,
    });
  }

  async login(data: LoginDto): Promise<TokensPayload> {
    return await this.prisma.$transaction(async (tx) => {
      const user = await this.repository.findUserByEmail(data.email, tx);

      if (
        !user ||
        !(await this.hashProvider.compare(data.pass, user.passwordHash))
      )
        throw new BadRequestException('Invalid credentials');

      const [accessToken, refreshToken] = [
        this.tokenProvider.sign({ sub: user.id, role: user.role }, 'access'),
        this.tokenProvider.sign({ sub: user.id, role: user.role }, 'refresh'),
      ];

      const refreshTokenHash = await this.hashProvider.hash(refreshToken);

      await this.repository.setAllRefreshRevokedByUserId(user.id, tx);
      await this.repository.createToken(user.id, refreshTokenHash, tx);

      return { accessToken, refreshToken };
    });
  }
  async refresh(refreshToken: string): Promise<TokensPayload> {
    return this.prisma.$transaction(async (tx) => {
      const payload = this.tokenProvider.verify<JwtPayload>(
        refreshToken,
        'refresh',
      );

      const actualRefresh = await this.repository.findTokenNotRevokedByUserId(
        payload.sub,
        tx,
      );

      if (
        !actualRefresh ||
        actualRefresh.expiresAt < new Date() ||
        !(await this.hashProvider.compare(
          refreshToken,
          actualRefresh.tokenHash,
        ))
      ) {
        throw new BadRequestException('Invalid refresh token');
      }

      const newAccessToken = this.tokenProvider.sign(
        { sub: payload.sub, role: payload.role },
        'access',
      );
      const newRefreshToken = this.tokenProvider.sign(
        { sub: payload.sub, role: payload.role },
        'refresh',
      );

      const refreshHash = await this.hashProvider.hash(newRefreshToken);
      const newRefreshId = await this.repository.createToken(
        payload.sub,
        refreshHash,
        tx,
      );
      await this.repository.revokeRefreshToken(
        actualRefresh.id,
        newRefreshId,
        tx,
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    });
  }

  async logout(userId: string): Promise<void> {
    await this.repository.setAllRefreshRevokedByUserId(userId);
  }
}
