import { UserEntity } from '../entities/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import { AuthUser } from 'src/security/strategies/jwt.strategy';

export interface IUsersService {
  findAll(offset: number, limit: number): Promise<UserEntity[]>;
  find(authUser: AuthUser, targetUserId: string): Promise<UserEntity>;
  update(
    authUser: AuthUser,
    targetUserId: string,
    data: UpdateUserDto,
  ): Promise<UserEntity>;
  delete(authUser: AuthUser, targetUserId: string): Promise<UserEntity>;
}
