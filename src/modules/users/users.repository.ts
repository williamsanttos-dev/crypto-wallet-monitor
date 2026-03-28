import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import type { IUserRepository } from './interfaces/user.repository.interface';
import { UserEntity } from './entities/user.entity';
import { toRole } from 'src/helpers/to-role';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(offset: number, limit: number): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: offset,
      take: limit,
    });

    return users.map((user) => ({
      ...user,
      role: toRole(user.role),
    }));
  }
}
