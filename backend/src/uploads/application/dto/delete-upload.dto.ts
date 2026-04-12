import { IsString, MinLength } from 'class-validator';

export class DeleteUploadBodyDto {
  @IsString()
  @MinLength(1)
  key!: string;
}
