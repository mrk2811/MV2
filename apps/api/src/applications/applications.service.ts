import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto, ReviewApplicationDto } from './applications.dto';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async findByTenant(tenantId: string, status?: string) {
    const where: Record<string, unknown> = { tenantId };
    if (status) where.status = status;

    return this.prisma.application.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            globalDisplayName: true,
            globalPhotos: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateApplicationDto, currentUserId?: string) {
    const userId = dto.userId || currentUserId;
    if (!userId) throw new ConflictException('userId is required');

    const existing = await this.prisma.application.findUnique({
      where: {
        userId_tenantId: { userId, tenantId: dto.tenantId },
      },
    });
    if (existing) throw new ConflictException('Application already submitted');

    return this.prisma.application.create({
      data: {
        userId,
        tenantId: dto.tenantId,
        answers: dto.answers,
      },
    });
  }

  async review(
    applicationId: string,
    dto: ReviewApplicationDto,
    currentUserId?: string,
  ) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });
    if (!application) throw new NotFoundException('Application not found');

    const reviewedBy = dto.reviewedBy || currentUserId;

    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        status: dto.status,
        reviewedBy,
        reviewedAt: new Date(),
      },
    });

    if (dto.status === 'APPROVED') {
      await this.prisma.tenantMembership.upsert({
        where: {
          userId_tenantId: {
            userId: application.userId,
            tenantId: application.tenantId,
          },
        },
        update: {
          status: 'ACTIVE',
          approvedBy: dto.reviewedBy,
        },
        create: {
          userId: application.userId,
          tenantId: application.tenantId,
          status: 'ACTIVE',
          approvedBy: dto.reviewedBy,
        },
      });
    }

    return updated;
  }
}
