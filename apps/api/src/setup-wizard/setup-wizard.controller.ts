import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SetupWizardService } from './setup-wizard.service';
import { UpdateWizardStepDto, FinalizeWizardDto } from './setup-wizard.dto';
import { SkipTenant } from '../auth/decorators/require-tenant.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

interface AuthenticatedUser {
  id: string;
}

@ApiTags('setup-wizard')
@ApiBearerAuth()
@Controller('setup-wizard')
@SkipTenant()
export class SetupWizardController {
  constructor(private readonly wizardService: SetupWizardService) {}

  @Post()
  @ApiOperation({ summary: 'Get or create a setup wizard draft for current admin' })
  getOrCreate(@CurrentUser() user: AuthenticatedUser) {
    return this.wizardService.getOrCreateDraft(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get wizard draft by ID' })
  getDraft(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.wizardService.getDraft(id, user.id);
  }

  @Patch(':id/step')
  @ApiOperation({ summary: 'Save progress for a wizard step' })
  updateStep(
    @Param('id') id: string,
    @Body() dto: UpdateWizardStepDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.wizardService.updateStep(id, user.id, dto);
  }

  @Post(':id/finalize')
  @ApiOperation({ summary: 'Finalize wizard and create the community' })
  finalize(
    @Param('id') id: string,
    @Body() dto: FinalizeWizardDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.wizardService.finalize(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a wizard draft' })
  deleteDraft(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.wizardService.deleteDraft(id, user.id);
  }
}
