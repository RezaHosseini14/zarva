import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import type { IAuthUser } from '../features/auth/auth.types';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): IAuthUser => {
    const request = ctx.switchToHttp().getRequest<{ user: IAuthUser }>();
    return request.user;
  },
);
