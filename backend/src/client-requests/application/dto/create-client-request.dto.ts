import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateClientRequestBodyDto {
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  detail?: string | null;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  budget: string;
}
