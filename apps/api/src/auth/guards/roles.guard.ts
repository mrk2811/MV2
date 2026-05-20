import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';

interface TenantData {
  id: string;
  adminUserId: string;
}

interface UserData {
  id: string;
}

@Injectable()
export class RolesGuard implements CanActivate {
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

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as unknown as Record<string, unknown>)['user'] as
      | UserData
      | undefined;
    const tenant = (request as unknown as Record<string, unknown>)[
      'tenant'
    ] as TenantData | undefined;

    if (!user) throw new ForbiddenException('Authentication required');

    if (requiredRoles.includes('SUPER_ADMIN')) {
      const isSuperAdmin = await this.checkSuperAdmin(user.id);
      if (isSuperAdmin) return true;
    }

    if (requiredRoles.includes('ADMIN')) {
      if (tenant && tenant.adminUserId === user.id) return true;

      if (tenant) {
        const membership = await this.prisma.tenantMembership.findUnique({
          where: {
            userId_tenantId: { userId: user.id, tenantId: tenant.id },
          },
        });
        if (membership && membership.role === 'ADMIN') return true;
      }
    }

    if (requiredRoles.includes('MEMBER')) {
      if (!tenant) throw new ForbiddenException('Tenant context required');
      if (tenant.adminUserId === user.id) return true;

      const membership = await this.prisma.tenantMembership.findUnique({
        where: {
          userId_tenantId: { userId: user.id, tenantId: tenant.id },
        },
      });
      if (membership && membership.status === 'ACTIVE') return true;
    }

    throw new ForbiddenException('Insufficient permissions');
  }

  private async checkSuperAdmin(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    return user?.verificationState === 'SUPER_ADMIN';
  }
}
