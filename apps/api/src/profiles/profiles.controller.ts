import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto, UpdateProfileDto } from './profiles.dto';
import { SkipTenant } from '../auth/decorators/require-tenant.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

interface AuthenticatedUser {
  id: string;
}

@ApiTags('profiles')
@ApiBearerAuth()
@Controller('profiles')
@SkipTenant()
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('tenant/:tenantId')
  @Roles('MEMBER')
  @ApiOperation({ summary: 'List visible profiles in a community' })
  findByTenant(@Param('tenantId') tenantId: string) {
    return this.profilesService.findByTenant(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single profile' })
  findOne(@Param('id') id: string) {
    return this.profilesService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a local profile for a community' })
  create(
    @Body() dto: CreateProfileDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.profilesService.create(dto, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a local profile' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProfileDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.profilesService.update(id, dto, user.id);
  }
}
