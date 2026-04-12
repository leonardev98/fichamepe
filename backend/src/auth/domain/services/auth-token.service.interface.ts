import type { UserRole } from '../../../users/domain/entities/user';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export type RequestUser = JwtPayload;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthTokenService {
  issueTokens(payload: JwtPayload): AuthTokens;
  verifyRefreshToken(refreshToken: string): JwtPayload;
}
