import { Role } from 'src/enums/role.enum';

export type JwtPayload = {
  sub: string;
  role: Role;
};

export interface ITokenProvider {
  sign(payload: JwtPayload, type: 'access' | 'refresh'): string;
  verify<T>(token: string, type: 'access' | 'refresh'): T;
}
