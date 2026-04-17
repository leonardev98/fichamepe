import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsIn,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import type { ServiceStatus } from '../../domain/entities/service.domain';

const SERVICE_STATUSES: ServiceStatus[] = [
  'ACTIVA',
  'BORRADOR',
  'PAUSADA',
  'EN_REVISION',
  'REQUIERE_CAMBIOS',
];

export class UpdateServiceBodyDto {
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(80)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(80)
  @MaxLength(600)
  description?: string;

  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @Type(() => Number)
  @IsNumber()
  @Min(5)
  price?: number | null;

  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @Type(() => Number)
  @IsNumber()
  listPrice?: number | null;

  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined && v !== '')
  @IsDateString()
  promoEndsAt?: string | null;

  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined && v !== '')
  @IsString()
  @MaxLength(2048)
  coverImageUrl?: string | null;

  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' || value === true
      ? true
      : value === 'false' || value === false
        ? false
        : undefined,
  )
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  @MaxLength(20, { each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(40)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  deliveryMode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  deliveryTime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  revisionsIncluded?: string;

  @IsOptional()
  @IsIn(SERVICE_STATUSES)
  status?: ServiceStatus;
}
