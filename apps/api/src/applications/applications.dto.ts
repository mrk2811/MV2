import { IsString, IsObject, IsIn, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateApplicationDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  tenantId: string;

  @ApiProperty({ example: { q1: 'Answer 1', q2: 'Answer 2' } })
  @IsObject()
  answers: Record<string, string>;
}

export class ReviewApplicationDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
  @IsIn(['APPROVED', 'REJECTED'])
  status: string;

  @ApiProperty()
  @IsString()
  reviewedBy: string;
}
