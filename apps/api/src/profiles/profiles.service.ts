import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto, UpdateProfileDto } from './profiles.dto';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async findByTenant(tenantId: string) {
    return this.prisma.localProfile.findMany({
      where: { tenantId, isVisible: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const profile = await this.prisma.localProfile.findUnique({
      where: { id },
    });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  async create(dto: CreateProfileDto, currentUserId?: string) {
    const userId = dto.userId || currentUserId;
    if (!userId) throw new ConflictException('userId is required');

    const existing = await this.prisma.localProfile.findUnique({
      where: {
        userId_tenantId: { userId, tenantId: dto.tenantId },
      },
    });
    if (existing) throw new ConflictException('Profile already exists for this community');

    return this.prisma.localProfile.create({
      data: {
        userId,
        tenantId: dto.tenantId,
        displayName: dto.displayName,
        age: dto.age,
        photos: dto.photos ?? [],
        bio: dto.bio,
        prompts: dto.prompts
          ? JSON.parse(JSON.stringify(dto.prompts))
          : [],
        customTags: dto.customTags
          ? JSON.parse(JSON.stringify(dto.customTags))
          : {},
      },
    });
  }

  async update(id: string, dto: UpdateProfileDto, _currentUserId?: string) {
    await this.findById(id);
    const data: Record<string, unknown> = { ...dto };
    if (dto.prompts) {
      data.prompts = JSON.parse(JSON.stringify(dto.prompts));
    }
    if (dto.customTags) {
      data.customTags = JSON.parse(JSON.stringify(dto.customTags));
    }
    return this.prisma.localProfile.update({ where: { id }, data });
  }
}
