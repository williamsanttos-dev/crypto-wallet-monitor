import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import type { IUserRepository } from './interfaces/user.repository.interface';
import { UserEntity } from './entities/user.entity';
import { toRole } from 'src/helpers/to-role';
import { UpdateUserDto } from './dto/update-user.dto';

type PrismaErrorWithCode = {
  code?: string;
};

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    offset: number,
    limit: number,
    isActive?: boolean,
  ): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany({
      where: {
        isActive,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
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

  async find(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return null;

    return {
      ...user,
      role: toRole(user.role),
    };
  }

  async update(id: string, data: UpdateUserDto): Promise<UserEntity | null> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          username: data.username,
        },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        ...user,
        role: toRole(user.role),
      };
    } catch (error) {
      if ((error as PrismaErrorWithCode).code === 'P2025') {
        return null;
      }

      throw error;
    }
  }

  async delete(id: string): Promise<UserEntity | null> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          isActive: false,
        },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        ...user,
        role: toRole(user.role),
      };
    } catch (error) {
      if ((error as PrismaErrorWithCode).code === 'P2025') {
        return null;
      }

      throw error;
    }
  }

  async reactivate(id: string): Promise<UserEntity | null> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        ...user,
        role: toRole(user.role),
      };
    } catch (error) {
      if ((error as PrismaErrorWithCode).code === 'P2025') {
        return null;
      }

      throw error;
    }
  }

  async userIsActive(id: string): Promise<boolean> {
    const isActive = await this.prisma.user.findFirst({
      where: {
        id,
        isActive: true,
      },
      select: {
        isActive: true,
      },
    });
    return isActive ? true : false;
  }
}
