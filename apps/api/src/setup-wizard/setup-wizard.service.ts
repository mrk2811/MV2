import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateWizardStepDto, FinalizeWizardDto } from './setup-wizard.dto';

@Injectable()
export class SetupWizardService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateDraft(adminUserId: string) {
    const existing = await this.prisma.setupWizardDraft.findFirst({
      where: { adminUserId, isComplete: false },
      orderBy: { updatedAt: 'desc' },
    });

    if (existing) return existing;

    return this.prisma.setupWizardDraft.create({
      data: { adminUserId, currentStep: 1, data: {} },
    });
  }

  async getDraft(draftId: string, adminUserId: string) {
    const draft = await this.prisma.setupWizardDraft.findUnique({
      where: { id: draftId },
    });
    if (!draft) throw new NotFoundException('Wizard draft not found');
    if (draft.adminUserId !== adminUserId) {
      throw new ForbiddenException('Not your draft');
    }
    return draft;
  }

  async updateStep(
    draftId: string,
    adminUserId: string,
    dto: UpdateWizardStepDto,
  ) {
    const draft = await this.getDraft(draftId, adminUserId);
    if (draft.isComplete) {
      throw new ConflictException('Wizard already finalized');
    }

    const currentData = (draft.data as Record<string, unknown>) || {};
    const stepKey = `step${dto.step}`;
    const updatedData = { ...currentData, [stepKey]: dto.data };

    const newStep = Math.max(draft.currentStep, dto.step + 1);

    return this.prisma.setupWizardDraft.update({
      where: { id: draftId },
      data: {
        data: JSON.parse(JSON.stringify(updatedData)),
        currentStep: Math.min(newStep, 10),
      },
    });
  }

  async finalize(draftId: string, adminUserId: string, dto: FinalizeWizardDto) {
    const draft = await this.getDraft(draftId, adminUserId);
    if (draft.isComplete) {
      throw new ConflictException('Wizard already finalized');
    }

    const existingSlug = await this.prisma.tenant.findUnique({
      where: { slug: dto.slug },
    });
    if (existingSlug) throw new ConflictException('Slug already taken');

    const tenant = await this.prisma.tenant.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        adminUserId,
        adminPseudonym: dto.adminPseudonym,
        geographicAnchor: dto.geographicAnchor,
        logoUrl: dto.logoUrl,
        accentColor: dto.accentColor ?? '#E63946',
        themeMode: dto.themeMode ?? 'DARK',
        layoutType: dto.layoutType ?? 'PROMPT_FIRST_FEED',
        anchorLink: dto.anchorLink,
        gatekeeperQuestions: dto.gatekeeperQuestions
          ? JSON.parse(JSON.stringify(dto.gatekeeperQuestions))
          : [],
        communityRules: dto.communityRules
          ? JSON.parse(JSON.stringify(dto.communityRules))
          : [],
        pricingType: dto.pricingType ?? 'FREE',
        subscriptionPrice: dto.subscriptionPrice,
        tokenCost: dto.tokenCost,
        acceptsPassport: dto.acceptsPassport ?? false,
        welcomeMessage: dto.welcomeMessage,
        customTags: dto.customTags
          ? JSON.parse(JSON.stringify(dto.customTags))
          : [],
        matchmakerEnabled: dto.matchmakerEnabled ?? false,
      },
    });

    await this.prisma.tenantMembership.create({
      data: {
        userId: adminUserId,
        tenantId: tenant.id,
        status: 'ACTIVE',
        role: 'ADMIN',
      },
    });

    await this.prisma.setupWizardDraft.update({
      where: { id: draftId },
      data: {
        isComplete: true,
        tenantId: tenant.id,
        currentStep: 10,
      },
    });

    return tenant;
  }

  async deleteDraft(draftId: string, adminUserId: string) {
    await this.getDraft(draftId, adminUserId);
    await this.prisma.setupWizardDraft.delete({ where: { id: draftId } });
    return { deleted: true };
  }
}
