import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ReviewModerationReportBodyDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reviewNote?: string;
}
