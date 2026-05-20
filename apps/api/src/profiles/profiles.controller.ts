import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto, UpdateProfileDto } from './profiles.dto';

@ApiTags('profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('tenant/:tenantId')
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
  create(@Body() dto: CreateProfileDto) {
    return this.profilesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a local profile' })
  update(@Param('id') id: string, @Body() dto: UpdateProfileDto) {
    return this.profilesService.update(id, dto);
  }
}
