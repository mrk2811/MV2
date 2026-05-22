import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OnboardingService } from './onboarding.service';
import { SkipTenant } from '../auth/decorators/require-tenant.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

interface AuthenticatedUser {
  id: string;
}

@ApiTags('onboarding')
@ApiBearerAuth()
@Controller('onboarding')
@SkipTenant()
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get('state/:tenantId')
  @ApiOperation({
    summary: 'Get onboarding state for a user in a community',
    description:
      'Returns the current onboarding stage (DOORBELL, WAITING_ROOM, PROFILE_SETUP, COMPLETE, REJECTED)',
  })
  getState(
    @Param('tenantId') tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.onboardingService.getOnboardingState(user.id, tenantId);
  }

  @Get('memberships')
  @ApiOperation({ summary: 'Get all active community memberships for current user' })
  getMemberships(@CurrentUser() user: AuthenticatedUser) {
    return this.onboardingService.getUserMemberships(user.id);
  }

  @Get('applications')
  @ApiOperation({ summary: 'Get all applications submitted by current user' })
  getApplications(@CurrentUser() user: AuthenticatedUser) {
    return this.onboardingService.getUserApplications(user.id);
  }

  @Get('discover')
  @ApiOperation({
    summary: 'Discover communities the user has not joined or applied to',
  })
  discover(@CurrentUser() user: AuthenticatedUser) {
    return this.onboardingService.discoverCommunities(user.id);
  }
}
