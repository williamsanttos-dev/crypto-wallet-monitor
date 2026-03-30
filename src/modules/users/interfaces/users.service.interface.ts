import { UserEntity } from '../entities/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';

export interface IUsersService {
  findAll(offset: number, limit: number): Promise<UserEntity[]>;
  find(id: string): Promise<UserEntity>;
  update(id: string, data: UpdateUserDto): Promise<UserEntity>;
}
