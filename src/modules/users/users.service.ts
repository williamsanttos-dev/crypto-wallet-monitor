import { Inject } from '@nestjs/common';
import { Injectable } from '@nestjs/common';

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
}
