import { createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

export const CurrentUser = createParamDecorator((_, ctx) => {
  const request: Request = ctx.switchToHttp().getRequest();
  return request;
});

// @Get('me')
// getMe(@CurrentUser() user) {
//   return user;
// }
