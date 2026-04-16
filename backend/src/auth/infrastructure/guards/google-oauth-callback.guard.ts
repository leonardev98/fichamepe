import {
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { isGoogleOAuthConfigured } from '../utils/google-oauth-env';

@Injectable()
export class GoogleOAuthCallbackGuard extends AuthGuard('google') {
  constructor(private readonly config: ConfigService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    if (!isGoogleOAuthConfigured(this.config)) {
      throw new ServiceUnavailableException(
        'Google OAuth no está configurado.',
      );
    }
    return super.canActivate(context) as Promise<boolean>;
  }

  getAuthenticateOptions() {
    const fe = (
      this.config.get<string>('FRONTEND_URL')?.trim() ||
      'http://localhost:3000'
    ).replace(/\/$/, '');
    return {
      session: false,
      failureRedirect: `${fe}/auth/login?error=google`,
    };
  }
}
