import { createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

type AuthRequest = Request & {
  user: {
    userId: string;
  };
};

export const CurrentUser = createParamDecorator((_, ctx) => {
  const request: Request = ctx.switchToHttp().getRequest<AuthRequest>();
  return request.user;
});
