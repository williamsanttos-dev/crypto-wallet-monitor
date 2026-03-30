import { UserEntity } from '../entities/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';

export interface IUserRepository {
  findAll(offset: number, limit: number): Promise<UserEntity[]>;
  find(id: string): Promise<UserEntity | null>;
  update(id: string, data: UpdateUserDto): Promise<UserEntity | null>;
  delete(id: string): Promise<UserEntity | null>;
  userIsActive(id: string): Promise<boolean>;
}
