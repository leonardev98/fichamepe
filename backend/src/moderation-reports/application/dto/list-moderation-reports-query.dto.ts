import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import type { ModerationTargetType } from '../../infrastructure/persistence/entities/moderation-report.orm-entity';

const STATUSES = ['pending', 'dismissed', 'actioned', 'all'] as const;

const TARGET_TYPES: ModerationTargetType[] = [
  'service',
  'client_request',
  'client_request_comment',
  'user',
];

export class ListModerationReportsQueryDto {
  @IsOptional()
  @IsIn(STATUSES)
  reviewStatus?: (typeof STATUSES)[number];

  @IsOptional()
  @IsIn(TARGET_TYPES)
  targetType?: ModerationTargetType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}
