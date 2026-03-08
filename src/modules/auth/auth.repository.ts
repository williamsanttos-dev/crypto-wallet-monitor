import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import {
  createPayload,
  IAuthRepository,
  UserAuth,
} from './interfaces/auth.repository.interface';

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

  async create(data: createPayload): Promise<void> {
    await this.prisma.user.create({
      data: data,
    });
  }

  async findUserByEmail(email: string): Promise<UserAuth | null> {
    return await this.prisma.user.findFirst({
      where: {
        email: email,
      },
      select: {
        id: true,
        passwordHash: true,
      },
    });
  }
}
