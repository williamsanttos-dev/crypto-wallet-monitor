import { UserEntity } from '../entities/user.entity';

export interface IUserRepository {
  findAll(offset: number, limit: number): Promise<UserEntity[]>;
  find(id: string): Promise<UserEntity | null>;
}
