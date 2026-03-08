import jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';

import { ITokenProvider, JwtPayload } from './token.provider.interface';

@Injectable()
export class JwtTokenProvider implements ITokenProvider {
  sign(payload: JwtPayload, type: 'access' | 'refresh'): string {
    const algorithm = 'HS256';

    if (type === 'access')
      return jwt.sign(payload, process.env.SECRET_ACCESS_TOKEN, {
        expiresIn: '12h',
        algorithm,
      });
    return jwt.sign(payload, process.env.SECRET_REFRESH_TOKEN, {
      expiresIn: '7d',
      algorithm,
    });
  }
  verify<T>(token: string, type: 'access' | 'refresh'): T {
    if (type === 'access')
      return jwt.verify(token, process.env.SECRET_ACCESS_TOKEN) as T;
    return jwt.verify(token, process.env.SECRET_REFRESH_TOKEN) as T;
  }
}
