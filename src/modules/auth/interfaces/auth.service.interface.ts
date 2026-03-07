import { CreateUserDto } from '../dto/create-user.dto';

export interface IAuthService {
  register(data: CreateUserDto): Promise<void>;
}
