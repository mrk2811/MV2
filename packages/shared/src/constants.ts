export const LAYOUT_TYPES = [
  'PROMPT_FIRST_FEED',
  'CURATED_MATCH_QUEUE',
  'DISCORD_CHANNEL_MATRIX',
  'WHATSAPP_DIRECT_LIST',
  'GRID_SINGLES_ROSTER',
] as const;

export const MEMBERSHIP_STATUSES = [
  'PENDING_REVIEW',
  'ACTIVE',
  'REJECTED',
  'BANNED',
  'EXPIRED',
] as const;

export const APPLICATION_STATUSES = [
  'PENDING',
  'APPROVED',
  'REJECTED',
] as const;

export const PRICING_TYPES = [
  'FREE',
  'SUBSCRIPTION',
  'TOKEN',
] as const;

export const THEME_MODES = ['LIGHT', 'DARK'] as const;

export const MATCH_STATES = [
  'PENDING',
  'MUTUAL',
  'EXPIRED',
] as const;

export const MODERATION_ACTION_TYPES = [
  'WARNING',
  'LOCAL_BAN',
] as const;

export const TOKEN_TRANSACTION_TYPES = [
  'PURCHASE',
  'REDEMPTION',
  'REFUND',
  'EXPIRY',
] as const;

export const MAX_GATEKEEPER_QUESTIONS = 3;
export const MAX_COMMUNITY_RULES = 5;
export const MAX_CUSTOM_TAGS = 5;
export const MIN_VIABLE_COMMUNITY_SIZE = 80;

export const PLATFORM_REVENUE_SHARE = 0.15;
export const ADMIN_REVENUE_SHARE = 0.85;

export const SUBSCRIPTION_PRICE_DEFAULT = 9.99;
export const PASSPORT_PRICE = 29.99;

export const THREE_STRIKE_BAN_THRESHOLD = 3;

export const DARK_THEME = {
  BG: '#0F0F10',
  CARD: '#1A1A1D',
  CARD2: '#222226',
  SUB: '#888892',
  BORDER: '#2A2A2E',
  ACCENT: '#E63946',
} as const;

export const LIGHT_THEME = {
  BG: '#FFFFFF',
  CARD: '#F5F5F5',
  CARD2: '#EBEBEB',
  SUB: '#666666',
  BORDER: '#E0E0E0',
  ACCENT: '#E63946',
} as const;
