import {
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { encodeGoogleOAuthState } from '../utils/google-oauth-state';
import { isGoogleOAuthConfigured } from '../utils/google-oauth-env';

@Injectable()
export class GoogleOAuthStartGuard extends AuthGuard('google') {
  constructor(private readonly config: ConfigService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    if (!isGoogleOAuthConfigured(this.config)) {
      throw new ServiceUnavailableException(
        'Google OAuth no está configurado (faltan GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET o GOOGLE_CALLBACK_URL).',
      );
    }
    return super.canActivate(context) as Promise<boolean>;
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    const rawFrom = req.query['from'];
    const from =
      typeof rawFrom === 'string' && rawFrom.startsWith('/')
        ? rawFrom
        : '/';
    const rawRef = req.query['referral'];
    const referral =
      typeof rawRef === 'string' ? rawRef.trim().toUpperCase() : '';
    const rawRole = req.query['role'];
    const role =
      rawRole === 'client' || rawRole === 'freelancer' ? rawRole : undefined;
    return {
      scope: ['email', 'profile'],
      session: false,
      state: encodeGoogleOAuthState({
        from,
        ...(referral ? { referral } : {}),
        ...(role ? { role } : {}),
      }),
    };
  }
}
