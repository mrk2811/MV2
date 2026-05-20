import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const CLERK_ONLY_KEY = 'clerkOnly';
export const ClerkOnly = () => SetMetadata(CLERK_ONLY_KEY, true);
