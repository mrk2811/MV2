import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto, UpdateTenantDto } from './tenants.dto';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tenant.findMany({
      where: { isActive: true },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        logoUrl: true,
        accentColor: true,
        themeMode: true,
        layoutType: true,
        geographicAnchor: true,
        pricingType: true,
        anchorLink: true,
        createdAt: true,
        _count: { select: { memberships: { where: { status: 'ACTIVE' } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            memberships: { where: { status: 'ACTIVE' } },
            matches: true,
          },
        },
      },
    });
    if (!tenant) throw new NotFoundException('Community not found');
    return tenant;
  }

  async findById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            memberships: { where: { status: 'ACTIVE' } },
            matches: true,
          },
        },
      },
    });
    if (!tenant) throw new NotFoundException('Community not found');
    return tenant;
  }

  async create(dto: CreateTenantDto, currentUserId?: string) {
    const existing = await this.prisma.tenant.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) throw new ConflictException('Slug already taken');

    const adminUserId = dto.adminUserId || currentUserId;
    if (!adminUserId) {
      throw new ConflictException('adminUserId is required');
    }

    return this.prisma.tenant.create({
      data: {
        ...dto,
        adminUserId,
        gatekeeperQuestions: dto.gatekeeperQuestions
          ? JSON.parse(JSON.stringify(dto.gatekeeperQuestions))
          : [],
        communityRules: dto.communityRules
          ? JSON.parse(JSON.stringify(dto.communityRules))
          : [],
        customTags: dto.customTags
          ? JSON.parse(JSON.stringify(dto.customTags))
          : [],
      },
    });
  }

  async update(id: string, dto: UpdateTenantDto) {
    await this.findById(id);
    const data: Record<string, unknown> = { ...dto };
    if (dto.gatekeeperQuestions) {
      data.gatekeeperQuestions = JSON.parse(
        JSON.stringify(dto.gatekeeperQuestions),
      );
    }
    if (dto.communityRules) {
      data.communityRules = JSON.parse(JSON.stringify(dto.communityRules));
    }
    if (dto.customTags) {
      data.customTags = JSON.parse(JSON.stringify(dto.customTags));
    }
    return this.prisma.tenant.update({ where: { id }, data });
  }

  async getStats(id: string) {
    const tenant = await this.findById(id);
    const [activeMembers, pendingApps, totalMatches] = await Promise.all([
      this.prisma.tenantMembership.count({
        where: { tenantId: id, status: 'ACTIVE' },
      }),
      this.prisma.application.count({
        where: { tenantId: id, status: 'PENDING' },
      }),
      this.prisma.match.count({ where: { tenantId: id } }),
    ]);

    return {
      tenantId: id,
      tenantName: tenant.name,
      activeMembers,
      pendingApplications: pendingApps,
      totalMatches,
    };
  }
}
