import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, StrategyOptions } from 'passport-jwt';
import { Strategy } from 'passport-local';
import { Request } from 'express';

type JwtPayload = {
  sub?: string | undefined;
};

export interface AuthCookies {
  access_token?: string;
  refresh_token?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
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

  validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
    };
  }
}
