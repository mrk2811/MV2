import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { Request } from 'express';
import {
  IS_PUBLIC_KEY,
  CLERK_ONLY_KEY,
} from '../decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private clerk: ReturnType<typeof createClerkClient>;

  constructor(
    private reflector: Reflector,
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.clerk = createClerkClient({
      secretKey: this.config.get<string>('CLERK_SECRET_KEY', ''),
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const isClerkOnly = this.reflector.getAllAndOverride<boolean>(
      CLERK_ONLY_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);
    if (!token) throw new UnauthorizedException('Missing authorization token');

    try {
      const payload = await verifyToken(token, {
        secretKey: this.config.get<string>('CLERK_SECRET_KEY', ''),
      });
      const clerkId = payload.sub;

      (request as unknown as Record<string, unknown>)['clerkPayload'] = payload;

      if (isClerkOnly) {
        (request as unknown as Record<string, unknown>)['user'] = {
          clerkId,
          id: null,
        };
        return true;
      }

      const user = await this.prisma.user.findUnique({
        where: { clerkId },
      });

      if (!user) {
        throw new UnauthorizedException(
          'User not synced. Call POST /auth/sync first.',
        );
      }

      (request as unknown as Record<string, unknown>)['user'] = user;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractToken(request: Request): string | undefined {
    const auth = request.headers.authorization;
    if (!auth) return undefined;
    const [type, token] = auth.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
