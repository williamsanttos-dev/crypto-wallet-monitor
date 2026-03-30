import { Injectable } from '@nestjs/common';

import type { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  registerUserPayload,
  IAuthRepository,
  TokenNotRevokedPayload,
  UserAuth,
} from './interfaces/auth.repository.interface';
import { EXPIRE_REFRESH } from './const/expire-tokens';
import { toRole } from 'src/helpers/to-role';

@Injectable()
export class PrismaRepository implements IAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmailAndUsername(
    email: string,
    username: string,
  ): Promise<boolean> {
    const result = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    return result ? true : false;
  }

  async registerUser(data: registerUserPayload): Promise<void> {
    await this.prisma.user.create({
      data: data,
    });
  }

  async findUserByEmail(
    email: string,
    tx?: Prisma.TransactionClient,
  ): Promise<UserAuth | null> {
    const client = tx ?? this.prisma;

    const user: {
      id: string;
      passwordHash: string;
      role: string;
      isActive: boolean;
    } | null = await client.user.findFirst({
      where: {
        email: email,
        isActive: true,
      },
      select: {
        id: true,
        passwordHash: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      passwordHash: user.passwordHash,
      role: toRole(user.role),
      isActive: user.isActive,
    };
  }

  async findTokenNotRevokedByUserId(
    userId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<TokenNotRevokedPayload | null> {
    const client = tx ?? this.prisma;

    return await client.refreshToken.findFirst({
      where: {
        userId,
        revokedAt: null,
      },
      select: {
        expiresAt: true,
        id: true,
        tokenHash: true,
      },
    });
  }

  async setAllRefreshRevokedByUserId(
    userId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.prisma;

    await client.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  async createToken(
    userId: string,
    refreshTokenHash: string,
    tx?: Prisma.TransactionClient,
  ): Promise<string> {
    const client = tx ?? this.prisma;

    const token = await client.refreshToken.create({
      data: {
        userId,
        tokenHash: refreshTokenHash,
        expiresAt: new Date(Date.now() + EXPIRE_REFRESH),
      },
      select: {
        id: true,
      },
    });

    return token.id;
  }

  async revokeRefreshToken(
    tokenId: string,
    replacedByToken: string,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.prisma;

    await client.refreshToken.update({
      where: {
        id: tokenId,
      },
      data: {
        revokedAt: new Date(),
        replacedByToken,
      },
    });
  }
}
