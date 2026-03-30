import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { UpdateUserDto } from './dto/update-user.dto';
import type { IUserRepository } from './interfaces/user.repository.interface';
import type { IUsersService } from './interfaces/users.service.interface';
import { UserEntity } from './entities/user.entity';
import { Role } from 'src/enums/role.enum';
import { AuthUser } from 'src/security/strategies/jwt.strategy';

type PrismaErrorWithCode = {
  code?: string;
};

@Injectable()
export class UsersService implements IUsersService {
  constructor(
    @Inject('UserRepository')
    private readonly repository: IUserRepository,
  ) {}

  async findAll(offset: number, limit: number): Promise<UserEntity[]> {
    return await this.repository.findAll(offset, limit);
  }

  async find(authUser: AuthUser, targetUserId: string): Promise<UserEntity> {
    this.validateAccessScope(authUser, targetUserId);
    await this.ensureAuthenticatedUserCanOperate(authUser);

    const user = await this.repository.find(targetUserId);

    if (!user) throw new NotFoundException('USER_NOT_FOUND');

    return user;
  }

  async update(
    authUser: AuthUser,
    targetUserId: string,
    data: UpdateUserDto,
  ): Promise<UserEntity> {
    try {
      this.validateAccessScope(authUser, targetUserId);
      await this.ensureAuthenticatedUserCanOperate(authUser);

      const user = await this.repository.update(targetUserId, data);

      if (!user) throw new NotFoundException('USER_NOT_FOUND');

      return user;
    } catch (error) {
      if ((error as PrismaErrorWithCode).code === 'P2002') {
        throw new ConflictException('username already in use');
      }

      throw error;
    }
  }

  private validateAccessScope(authUser: AuthUser, targetUserId: string): void {
    const isAdmin = authUser.role === Role.ADMIN;
    const isSameUser = authUser.userId === targetUserId;

    if (!isAdmin && !isSameUser) {
      throw new ForbiddenException('FORBIDDEN_RESOURCE');
    }
  }
  private async ensureAuthenticatedUserCanOperate(
    authUser: AuthUser,
  ): Promise<void> {
    if (authUser.role === Role.ADMIN) {
      return;
    }

    const isActive = await this.repository.userIsActive(authUser.userId);

    if (!isActive) {
      throw new ForbiddenException(
        'INACTIVE_USERS_CANNOT_ACCESS_THIS_RESOURCE', // eslint-disable-line secure-coding/no-hardcoded-credentials
      );
    }
  }
}
