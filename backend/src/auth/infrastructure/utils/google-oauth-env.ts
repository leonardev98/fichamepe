import type { ConfigService } from '@nestjs/config';

export function isGoogleOAuthConfigured(config: ConfigService): boolean {
  return (
    !!config.get<string>('GOOGLE_CLIENT_ID')?.trim() &&
    !!config.get<string>('GOOGLE_CLIENT_SECRET')?.trim() &&
    !!config.get<string>('GOOGLE_CALLBACK_URL')?.trim()
  );
}
