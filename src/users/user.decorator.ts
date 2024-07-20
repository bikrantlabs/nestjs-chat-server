import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDocument } from 'src/entities/user.entity';

/**
 * Since Me() decorator is always used within AuthGuards, it will always contain req.user object
 */
export const Me = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as UserDocument;
  },
);
