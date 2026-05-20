import { IsString, IsOptional, IsEmail, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty()
  @IsString()
  globalDisplayName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  globalBio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  globalPhotos?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gender?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  globalDisplayName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  globalBio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  globalPhotos?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gender?: string;
}
