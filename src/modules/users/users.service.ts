import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { UpdateUserDto } from './dto/update-user.dto';
import type { IUserRepository } from './interfaces/user.repository.interface';
import type { IUsersService } from './interfaces/users.service.interface';
import { UserEntity } from './entities/user.entity';

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

  async find(id: string): Promise<UserEntity> {
    const user = await this.repository.find(id);

    if (!user) throw new NotFoundException('USER_NOT_FOUND');

    return user;
  }

  async update(id: string, data: UpdateUserDto): Promise<UserEntity> {
    try {
      const user = await this.repository.update(id, data);

      if (!user) throw new NotFoundException('USER_NOT_FOUND');

      return user;
    } catch (error) {
      if ((error as PrismaErrorWithCode).code === 'P2002') {
        throw new ConflictException('username already in use');
      }

      throw error;
    }
  }
}
