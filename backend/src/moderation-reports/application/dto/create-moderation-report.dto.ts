import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import type {
  ModerationReportReason,
  ModerationTargetType,
} from '../../infrastructure/persistence/entities/moderation-report.orm-entity';

const REASONS: ModerationReportReason[] = [
  'fraud',
  'inappropriate_content',
  'false_information',
  'spam',
  'other',
];

const TARGETS: ModerationTargetType[] = [
  'service',
  'client_request',
  'client_request_comment',
  'user',
];

export class CreateModerationReportDto {
  @IsEnum(TARGETS)
  targetType: ModerationTargetType;

  @IsUUID()
  targetId: string;

  @IsEnum(REASONS)
  reason: ModerationReportReason;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  details?: string;
}
