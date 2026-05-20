import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        globalDisplayName: true,
        globalBio: true,
        globalPhotos: true,
        gender: true,
        verificationState: true,
        createdAt: true,
      },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        tenantMemberships: {
          include: { tenant: { select: { id: true, name: true, slug: true } } },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(dto: CreateUserDto) {
    return this.prisma.user.create({ data: dto });
  }

  async update(id: string, dto: UpdateUserDto, currentUserId?: string) {
    if (currentUserId && currentUserId !== id) {
      throw new NotFoundException('Cannot update another user');
    }
    await this.findById(id);
    return this.prisma.user.update({ where: { id }, data: dto });
  }
}
