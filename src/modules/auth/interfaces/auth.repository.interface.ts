import type { Prisma } from 'generated/prisma/client';

export type registerUserPayload = {
  email: string;
  passwordHash: string;
  username: string;
};

export type UserAuth = {
  id: string;
  passwordHash: string;
};

export type TokenNotRevokedPayload = {
  tokenHash: string;
  expiresAt: Date;
  id: string;
};

export interface IAuthRepository {
  findUserByEmailAndUsername(email: string, username: string): Promise<boolean>;
  registerUser(data: registerUserPayload): Promise<void>;
  findUserByEmail(
    email: string,
    tx?: Prisma.TransactionClient,
  ): Promise<UserAuth | null>;
  createToken(
    userId: string,
    refreshTokenHash: string,
    tx?: Prisma.TransactionClient,
  ): Promise<string>;
  setAllRefreshRevokedByUserId(
    userId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<void>;
  findTokenNotRevokedByUserId(
    userId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<TokenNotRevokedPayload | null>;
  revokeRefreshToken(
    tokenId: string,
    replacedByToken: string,
    tx?: Prisma.TransactionClient,
  ): Promise<void>;
}

// setRevokedByUserId
//
