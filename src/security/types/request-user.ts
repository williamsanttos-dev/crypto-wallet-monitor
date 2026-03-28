import { Request } from 'express';
import { AuthUser } from '../strategies/jwt.strategy';

export type RequestWithUser = Request & {
  user: AuthUser;
};
