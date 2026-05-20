import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto, UpdateTenantDto } from './tenants.dto';
import { Public } from '../auth/decorators/public.decorator';
import { SkipTenant } from '../auth/decorators/require-tenant.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

interface AuthenticatedUser {
  id: string;
}

@ApiTags('tenants')
@Controller('tenants')
@SkipTenant()
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all active communities' })
  findAll() {
    return this.tenantsService.findAll();
  }

  @Get(':slug')
  @Public()
  @ApiOperation({ summary: 'Get community by slug (deep link)' })
  findBySlug(@Param('slug') slug: string) {
    return this.tenantsService.findBySlug(slug);
  }

  @Get(':id/stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get admin dashboard stats for a community' })
  getStats(@Param('id') id: string) {
    return this.tenantsService.getStats(id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new community (admin setup)' })
  create(
    @Body() dto: CreateTenantDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.tenantsService.create(dto, user.id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update community settings (admin only)' })
  update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.tenantsService.update(id, dto);
  }
}
