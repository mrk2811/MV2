import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto, UpdateTenantDto } from './tenants.dto';

@ApiTags('tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  @ApiOperation({ summary: 'List all active communities' })
  findAll() {
    return this.tenantsService.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get community by slug (deep link)' })
  findBySlug(@Param('slug') slug: string) {
    return this.tenantsService.findBySlug(slug);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get admin dashboard stats for a community' })
  getStats(@Param('id') id: string) {
    return this.tenantsService.getStats(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new community (admin setup)' })
  create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update community settings' })
  update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.tenantsService.update(id, dto);
  }
}
