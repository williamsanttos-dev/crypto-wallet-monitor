import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, StrategyOptions, Strategy } from 'passport-jwt';
import { Request } from 'express';

import { JwtPayload } from 'src/modules/auth/providers/token.provider.interface';
import { Role } from 'src/enums/role.enum';

export type AuthUser = {
  userId: string;
  role: Role;
};
export interface AuthCookies {
  access_token?: string;
  refresh_token?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    const options: StrategyOptions = {
      // Headers have size limit (cookies)
      // eslint-disable-next-line secure-coding/no-unlimited-resource-allocation
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request): string | null => {
          const cookies = req.cookies as AuthCookies;
          return cookies.access_token ?? null;
        },
      ]),
      secretOrKey: process.env.SECRET_ACCESS_TOKEN,
    };

    super(options);
  }

  validate(payload: JwtPayload): AuthUser {
    return {
      userId: payload.sub,
      role: payload.role,
    };
  }
}
