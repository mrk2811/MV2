import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto, ReviewApplicationDto } from './applications.dto';
import { SkipTenant } from '../auth/decorators/require-tenant.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

interface AuthenticatedUser {
  id: string;
}

@ApiTags('applications')
@ApiBearerAuth()
@Controller('applications')
@SkipTenant()
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get('tenant/:tenantId')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List applications for a community (admin only)' })
  @ApiQuery({ name: 'status', required: false })
  findByTenant(
    @Param('tenantId') tenantId: string,
    @Query('status') status?: string,
  ) {
    return this.applicationsService.findByTenant(tenantId, status);
  }

  @Post()
  @ApiOperation({ summary: 'Submit a doorbell application' })
  create(
    @Body() dto: CreateApplicationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.applicationsService.create(dto, user.id);
  }

  @Patch(':id/review')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Approve or reject an application (admin only)' })
  review(
    @Param('id') id: string,
    @Body() dto: ReviewApplicationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.applicationsService.review(id, dto, user.id);
  }
}
