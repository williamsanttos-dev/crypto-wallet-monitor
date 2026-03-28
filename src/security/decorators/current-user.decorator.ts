import { createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import { RequestWithUser } from '../types/request-user';

export const CurrentUser = createParamDecorator((_, ctx) => {
  const request: Request = ctx.switchToHttp().getRequest<RequestWithUser>();
  return request.user;
});
