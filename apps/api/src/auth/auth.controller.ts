import { Controller, Post, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { ClerkOnly } from './decorators/public.decorator';

interface ClerkOnlyUser {
  clerkId: string;
  id: null;
}

interface AuthenticatedUser {
  id: string;
  clerkId: string;
}

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sync')
  @ClerkOnly()
  @ApiOperation({
    summary: 'Sync Clerk user to local DB (call after first sign-in)',
  })
  sync(@CurrentUser() user: ClerkOnlyUser) {
    return this.authService.syncUser(user.clerkId);
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get current authenticated user with memberships',
  })
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getMe(user.id);
  }
}
