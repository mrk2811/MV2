import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClerkClient } from '@clerk/backend';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private clerk: ReturnType<typeof createClerkClient>;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.clerk = createClerkClient({
      secretKey: this.config.get<string>('CLERK_SECRET_KEY', ''),
    });
  }

  async syncUser(clerkId: string) {
    const existing = await this.prisma.user.findUnique({
      where: { clerkId },
    });
    if (existing) return existing;

    const clerkUser = await this.clerk.users.getUser(clerkId);

    const phone = clerkUser.primaryPhoneNumberId
      ? clerkUser.phoneNumbers.find(
          (p) => p.id === clerkUser.primaryPhoneNumberId,
        )?.phoneNumber
      : undefined;
    const email = clerkUser.primaryEmailAddressId
      ? clerkUser.emailAddresses.find(
          (e) => e.id === clerkUser.primaryEmailAddressId,
        )?.emailAddress
      : undefined;

    if (phone) {
      const byPhone = await this.prisma.user.findUnique({ where: { phone } });
      if (byPhone) {
        if (byPhone.clerkId && byPhone.clerkId !== clerkId) {
          throw new ConflictException('Phone number linked to another account');
        }
        return this.prisma.user.update({
          where: { id: byPhone.id },
          data: { clerkId },
        });
      }
    }

    if (email) {
      const byEmail = await this.prisma.user.findUnique({ where: { email } });
      if (byEmail) {
        if (byEmail.clerkId && byEmail.clerkId !== clerkId) {
          throw new ConflictException('Email linked to another account');
        }
        return this.prisma.user.update({
          where: { id: byEmail.id },
          data: { clerkId },
        });
      }
    }

    const displayName =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
      'New User';

    return this.prisma.user.create({
      data: {
        clerkId,
        phone: phone ?? null,
        email: email ?? null,
        globalDisplayName: displayName,
        globalPhotos: clerkUser.imageUrl ? [clerkUser.imageUrl] : [],
      },
    });
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenantMemberships: {
          where: { status: 'ACTIVE' },
          include: {
            tenant: {
              select: {
                id: true,
                name: true,
                slug: true,
                accentColor: true,
                layoutType: true,
                adminUserId: true,
              },
            },
          },
        },
        ownedTenants: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
