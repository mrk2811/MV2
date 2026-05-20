import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto, ReviewApplicationDto } from './applications.dto';

@ApiTags('applications')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get('tenant/:tenantId')
  @ApiOperation({ summary: 'List applications for a community' })
  @ApiQuery({ name: 'status', required: false })
  findByTenant(
    @Param('tenantId') tenantId: string,
    @Query('status') status?: string,
  ) {
    return this.applicationsService.findByTenant(tenantId, status);
  }

  @Post()
  @ApiOperation({ summary: 'Submit a doorbell application' })
  create(@Body() dto: CreateApplicationDto) {
    return this.applicationsService.create(dto);
  }

  @Patch(':id/review')
  @ApiOperation({ summary: 'Approve or reject an application' })
  review(@Param('id') id: string, @Body() dto: ReviewApplicationDto) {
    return this.applicationsService.review(id, dto);
  }
}
