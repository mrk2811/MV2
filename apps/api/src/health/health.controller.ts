import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { SkipTenant } from '../auth/decorators/require-tenant.decorator';

@ApiTags('health')
@Controller('health')
@Public()
@SkipTenant()
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
