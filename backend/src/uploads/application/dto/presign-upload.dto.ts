import { IsIn, IsString, MinLength } from 'class-validator';

const UPLOAD_TYPES = ['avatar', 'portfolio'] as const;

export class PresignUploadBodyDto {
  @IsString()
  @MinLength(1)
  filename!: string;

  @IsString()
  @MinLength(1)
  contentType!: string;

  @IsString()
  @IsIn(UPLOAD_TYPES)
  type!: (typeof UPLOAD_TYPES)[number];
}
