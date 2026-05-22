import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OnboardingService {
  constructor(private prisma: PrismaService) {}

  async getOnboardingState(userId: string, tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        accentColor: true,
        pricingType: true,
        gatekeeperQuestions: true,
        welcomeMessage: true,
        layoutType: true,
      },
    });
    if (!tenant) throw new NotFoundException('Community not found');

    const application = await this.prisma.application.findUnique({
      where: { userId_tenantId: { userId, tenantId } },
      select: {
        id: true,
        status: true,
        createdAt: true,
        reviewedAt: true,
      },
    });

    const membership = await this.prisma.tenantMembership.findUnique({
      where: { userId_tenantId: { userId, tenantId } },
      select: {
        id: true,
        status: true,
        role: true,
      },
    });

    const profile = await this.prisma.localProfile.findUnique({
      where: { userId_tenantId: { userId, tenantId } },
      select: { id: true },
    });

    let stage: string;
    if (membership?.status === 'ACTIVE' && profile) {
      stage = 'COMPLETE';
    } else if (membership?.status === 'ACTIVE' && !profile) {
      stage = 'PROFILE_SETUP';
    } else if (application?.status === 'APPROVED') {
      stage = 'PROFILE_SETUP';
    } else if (application?.status === 'PENDING') {
      stage = 'WAITING_ROOM';
    } else if (application?.status === 'REJECTED') {
      stage = 'REJECTED';
    } else {
      stage = 'DOORBELL';
    }

    return {
      tenant,
      stage,
      application,
      membership,
      hasProfile: !!profile,
    };
  }

  async getUserMemberships(userId: string) {
    return this.prisma.tenantMembership.findMany({
      where: { userId, status: 'ACTIVE' },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            accentColor: true,
            layoutType: true,
            pricingType: true,
            _count: {
              select: { memberships: { where: { status: 'ACTIVE' } } },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });
  }

  async getUserApplications(userId: string) {
    return this.prisma.application.findMany({
      where: { userId },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            accentColor: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async discoverCommunities(userId: string) {
    const existingMemberships = await this.prisma.tenantMembership.findMany({
      where: { userId },
      select: { tenantId: true },
    });
    const existingApplications = await this.prisma.application.findMany({
      where: { userId },
      select: { tenantId: true },
    });

    const excludeIds = [
      ...existingMemberships.map((m) => m.tenantId),
      ...existingApplications.map((a) => a.tenantId),
    ];

    return this.prisma.tenant.findMany({
      where: {
        isActive: true,
        ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
        accentColor: true,
        geographicAnchor: true,
        layoutType: true,
        pricingType: true,
        _count: { select: { memberships: { where: { status: 'ACTIVE' } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
