import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const CurrentTenant = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const tenant = (request as unknown as Record<string, unknown>)['tenant'];
    return data ? (tenant as Record<string, unknown>)?.[data] : tenant;
  },
);
