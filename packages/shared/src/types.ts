import type {
  LAYOUT_TYPES,
  MEMBERSHIP_STATUSES,
  APPLICATION_STATUSES,
  PRICING_TYPES,
  THEME_MODES,
  MATCH_STATES,
  MODERATION_ACTION_TYPES,
  TOKEN_TRANSACTION_TYPES,
} from './constants';

export type LayoutType = (typeof LAYOUT_TYPES)[number];
export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
export type PricingType = (typeof PRICING_TYPES)[number];
export type ThemeMode = (typeof THEME_MODES)[number];
export type MatchState = (typeof MATCH_STATES)[number];
export type ModerationActionType = (typeof MODERATION_ACTION_TYPES)[number];
export type TokenTransactionType = (typeof TOKEN_TRANSACTION_TYPES)[number];

export interface GatekeeperQuestion {
  id: string;
  text: string;
  type: 'FREE_TEXT' | 'URL' | 'MULTIPLE_CHOICE';
  options?: string[];
  minLength?: number;
}

export interface CommunityRule {
  id: string;
  text: string;
  order: number;
}

export interface CustomTag {
  id: string;
  name: string;
  type: 'CATEGORICAL' | 'METRIC' | 'SOCIAL';
  options?: string[];
}

export interface PricingConfig {
  type: PricingType;
  subscriptionPrice?: number;
  tokenCost?: number;
  acceptsPassport?: boolean;
}

export interface TenantPublic {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  accentColor: string;
  themeMode: ThemeMode;
  layoutType: LayoutType;
  memberCount: number;
  activeThisWeek: number;
  anchorLink: string | null;
  description: string | null;
}

export interface LocalProfilePublic {
  id: string;
  userId: string;
  tenantId: string;
  displayName: string;
  age: number;
  photos: string[];
  bio: string | null;
  prompts: ProfilePrompt[];
  customTags: Record<string, string>;
}

export interface ProfilePrompt {
  question: string;
  answer: string;
}

export interface MessagePublic {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface ConversationPublic {
  id: string;
  tenantId: string;
  participantIds: string[];
  lastMessage: MessagePublic | null;
  unreadCount: number;
  createdAt: string;
}

export interface ApplicationPublic {
  id: string;
  userId: string;
  tenantId: string;
  answers: Record<string, string>;
  status: ApplicationStatus;
  createdAt: string;
  reviewedAt: string | null;
}

export interface AdminDashboardStats {
  totalMembers: number;
  activeThisWeek: number;
  totalMatches: number;
  pendingApplications: number;
  monthlyRevenue: number;
  conversionRate: number;
}
