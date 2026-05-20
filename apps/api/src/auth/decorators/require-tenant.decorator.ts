import { SetMetadata } from '@nestjs/common';
import { REQUIRE_TENANT_KEY } from '../guards/tenant.guard';

export const SkipTenant = () => SetMetadata(REQUIRE_TENANT_KEY, false);
