import { UserEntity } from '../entities/user.entity';

export interface IUsersService {
  findAll(offset: number, limit: number): Promise<UserEntity[]>;
  find(id: string): Promise<UserEntity>;
}
