import {
  IsString,
  IsOptional,
  IsArray,
  IsObject,
  IsInt,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProfileDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  tenantId: string;

  @ApiProperty({ example: 'Sarah M.' })
  @IsString()
  displayName: string;

  @ApiPropertyOptional({ example: 27 })
  @IsOptional()
  @IsInt()
  age?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @ApiPropertyOptional({ example: 'Sunset runner & dog mom.' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    example: [{ question: 'My ideal Sunday is...', answer: 'Long run in Prospect Park' }],
  })
  @IsOptional()
  @IsArray()
  prompts?: unknown[];

  @ApiPropertyOptional({ example: { pace: '8:30/mi', distance: 'Half Marathon' } })
  @IsOptional()
  @IsObject()
  customTags?: Record<string, string>;
}

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  age?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  prompts?: unknown[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  customTags?: Record<string, string>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}
