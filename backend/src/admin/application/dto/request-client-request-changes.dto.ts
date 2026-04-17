import { IsString, MaxLength, MinLength } from 'class-validator';

export class RequestClientRequestChangesBodyDto {
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  comment: string;
}
