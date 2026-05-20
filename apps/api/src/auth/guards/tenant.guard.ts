import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';

export const REQUIRE_TENANT_KEY = 'requireTenant';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const requireTenant = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_TENANT_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (requireTenant === false) return true;

    const request = context.switchToHttp().getRequest<Request>();

    const tenantId =
      (request.headers['x-tenant-id'] as string) ||
      (request.params as Record<string, string>)['tenantId'];

    if (!tenantId) {
      throw new BadRequestException(
        'Missing tenant context. Provide x-tenant-id header or tenantId param.',
      );
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) throw new NotFoundException('Tenant not found');
    if (!tenant.isActive) throw new NotFoundException('Community is inactive');

    (request as unknown as Record<string, unknown>)['tenant'] = tenant;
    return true;
  }
}
