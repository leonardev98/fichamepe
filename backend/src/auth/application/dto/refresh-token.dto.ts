import { IsOptional, IsString } from 'class-validator';

/** El refresh puede ir en body, Authorization Bearer o header `x-refresh-token`. */
export class RefreshTokenDto {
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
