import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

function toSkillIdArray(value: unknown): string[] | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const arr = Array.isArray(value) ? value : [value];
  const out = arr.filter((v): v is string => typeof v === 'string' && v.trim().length > 0);
  return out.length ? out.map((s) => s.trim()) : undefined;
}

export class SearchProfilesQueryDto {
  /** Repetible: ?skill=uuid1&skill=uuid2 */
  @IsOptional()
  @Transform(({ value }) => toSkillIdArray(value))
  @IsArray()
  @IsUUID('4', { each: true })
  skill?: string[];

  @IsOptional()
  @IsUUID('4')
  skillId?: string;

  @IsOptional()
  @IsString()
  skillName?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) {
      return true;
    }
    if (value === 'false' || value === false) {
      return false;
    }
    return undefined;
  })
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxHourlyRate?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}
