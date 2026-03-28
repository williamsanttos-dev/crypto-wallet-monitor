import { CreateUserDto } from '../dto/create-user.dto';
import { LoginDto } from '../dto/login.dto';

export type TokensPayload = {
  accessToken: string;
  refreshToken: string;
};
export interface IAuthService {
  register(data: CreateUserDto): Promise<void>;
  login(data: LoginDto): Promise<TokensPayload>;
  refresh(refreshToken: string): Promise<TokensPayload>;
}
