import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type Profile } from 'passport-google-oauth20';

export type GoogleOAuthProfilePayload = {
  googleId: string;
  email: string;
  fullName: string | null;
};

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    super({
      clientID:
        config.get<string>('GOOGLE_CLIENT_ID')?.trim() || 'not-configured',
      clientSecret:
        config.get<string>('GOOGLE_CLIENT_SECRET')?.trim() ||
        'not-configured',
      callbackURL:
        config.get<string>('GOOGLE_CALLBACK_URL')?.trim() ||
        'http://127.0.0.1:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): GoogleOAuthProfilePayload {
    const emailRaw = profile.emails?.[0]?.value?.trim().toLowerCase();
    if (!emailRaw) {
      throw new UnauthorizedException('Google no devolvió un correo.');
    }
    const googleId = profile.id?.trim();
    if (!googleId) {
      throw new UnauthorizedException('Perfil de Google incompleto.');
    }
    const fullName = profile.displayName?.trim() || null;
    return { googleId, email: emailRaw, fullName };
  }
}
