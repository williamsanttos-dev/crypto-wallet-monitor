import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import type { IUserRepository } from './interfaces/user.repository.interface';
import type { IUsersService } from './interfaces/users.service.interface';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService implements IUsersService {
  constructor(
    @Inject('UserRepository')
    private readonly repository: IUserRepository,
  ) {}

  async findAll(offset: number, limit: number): Promise<UserEntity[]> {
    return await this.repository.findAll(offset, limit);
  }

  async find(id: string): Promise<UserEntity> {
    const user = await this.repository.find(id);

    if (!user) throw new NotFoundException('USER_NOT_FOUND');

    return user;
  }
}
