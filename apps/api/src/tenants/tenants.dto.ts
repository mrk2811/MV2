import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsIn,
  IsUrl,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({ example: 'Brooklyn Run Club Singles' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'brooklyn-runners' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ example: 'A singles community for Brooklyn runners' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'user-uuid-here' })
  @IsString()
  adminUserId: string;

  @ApiPropertyOptional({ example: 'Coach Mike' })
  @IsOptional()
  @IsString()
  adminPseudonym?: string;

  @ApiPropertyOptional({ example: 'Brooklyn, NY' })
  @IsOptional()
  @IsString()
  geographicAnchor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ example: '#E63946' })
  @IsOptional()
  @IsString()
  accentColor?: string;

  @ApiPropertyOptional({ enum: ['LIGHT', 'DARK'] })
  @IsOptional()
  @IsIn(['LIGHT', 'DARK'])
  themeMode?: string;

  @ApiPropertyOptional({
    enum: [
      'PROMPT_FIRST_FEED',
      'CURATED_MATCH_QUEUE',
      'DISCORD_CHANNEL_MATRIX',
      'WHATSAPP_DIRECT_LIST',
      'GRID_SINGLES_ROSTER',
    ],
  })
  @IsOptional()
  @IsIn([
    'PROMPT_FIRST_FEED',
    'CURATED_MATCH_QUEUE',
    'DISCORD_CHANNEL_MATRIX',
    'WHATSAPP_DIRECT_LIST',
    'GRID_SINGLES_ROSTER',
  ])
  layoutType?: string;

  @ApiPropertyOptional({ example: 'https://chat.whatsapp.com/abc123' })
  @IsOptional()
  @IsString()
  anchorLink?: string;

  @ApiPropertyOptional({ example: 'Welcome to Brooklyn Run Club Singles!' })
  @IsOptional()
  @IsString()
  welcomeMessage?: string;

  @ApiPropertyOptional({ enum: ['FREE', 'SUBSCRIPTION', 'TOKEN'] })
  @IsOptional()
  @IsIn(['FREE', 'SUBSCRIPTION', 'TOKEN'])
  pricingType?: string;

  @ApiPropertyOptional({ example: 9.99 })
  @IsOptional()
  @IsNumber()
  subscriptionPrice?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  tokenCost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  acceptsPassport?: boolean;

  @ApiPropertyOptional({ type: 'array', example: [] })
  @IsOptional()
  @IsArray()
  gatekeeperQuestions?: unknown[];

  @ApiPropertyOptional({ type: 'array', example: [] })
  @IsOptional()
  @IsArray()
  communityRules?: unknown[];

  @ApiPropertyOptional({ type: 'array', example: [] })
  @IsOptional()
  @IsArray()
  customTags?: unknown[];
}

export class UpdateTenantDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accentColor?: string;

  @ApiPropertyOptional({ enum: ['LIGHT', 'DARK'] })
  @IsOptional()
  @IsIn(['LIGHT', 'DARK'])
  themeMode?: string;

  @ApiPropertyOptional({
    enum: [
      'PROMPT_FIRST_FEED',
      'CURATED_MATCH_QUEUE',
      'DISCORD_CHANNEL_MATRIX',
      'WHATSAPP_DIRECT_LIST',
      'GRID_SINGLES_ROSTER',
    ],
  })
  @IsOptional()
  @IsIn([
    'PROMPT_FIRST_FEED',
    'CURATED_MATCH_QUEUE',
    'DISCORD_CHANNEL_MATRIX',
    'WHATSAPP_DIRECT_LIST',
    'GRID_SINGLES_ROSTER',
  ])
  layoutType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  anchorLink?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  welcomeMessage?: string;

  @ApiPropertyOptional({ enum: ['FREE', 'SUBSCRIPTION', 'TOKEN'] })
  @IsOptional()
  @IsIn(['FREE', 'SUBSCRIPTION', 'TOKEN'])
  pricingType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  subscriptionPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  tokenCost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  acceptsPassport?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  matchmakerEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  gatekeeperQuestions?: unknown[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  communityRules?: unknown[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  customTags?: unknown[];
}
