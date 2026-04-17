import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { IUserRepository } from '../../../users/domain/repositories';
import { UserRole } from '../../../users/domain/entities/user';
import { USER_REPOSITORY } from '../../../users/users.di-tokens';
import type { IProfileRepository } from '../../../profiles/domain/repositories/profile.repository.interface';
import { PROFILE_REPOSITORY } from '../../../profiles/profiles.di-tokens';
import { freelancerDefaultDisplayName } from '../../../profiles/application/utils/freelancer-default-display-name';
import type {
  AuthTokens,
  IAuthTokenService,
} from '../../domain/services/auth-token.service.interface';
import { AUTH_TOKEN_SERVICE } from '../../auth.di-tokens';
import type { GoogleOAuthStatePayload } from '../../infrastructure/utils/google-oauth-state';
import { REFERRAL_PUBLICATION_BONUS_CAP } from '../../../common/publication/publication-slots';

export type AuthenticateWithGoogleInput = {
  googleId: string;
  email: string;
  fullName: string | null;
  countryCode?: string | null;
  state: GoogleOAuthStatePayload;
};

export type AuthenticateWithGoogleResult = AuthTokens & {
  role: UserRole;
  userId: string;
  redirectPath: string;
};

@Injectable()
export class AuthenticateWithGoogleUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
    @Inject(AUTH_TOKEN_SERVICE)
    private readonly tokens: IAuthTokenService,
    @Inject(PROFILE_REPOSITORY)
    private readonly profiles: IProfileRepository,
  ) {}

  async execute(
    input: AuthenticateWithGoogleInput,
  ): Promise<AuthenticateWithGoogleResult> {
    const { googleId, email, fullName, countryCode, state } = input;
    const redirectPath =
      state.from?.startsWith('/') && !state.from.startsWith('//')
        ? state.from
        : '/';

    let user = await this.users.findByGoogleId(googleId);
    if (!user) {
      const byEmail = await this.users.findByEmail(email);
      if (byEmail) {
        if (byEmail.password) {
          throw new ConflictException(
            'Ya existe una cuenta con este correo y contraseña. Inicia sesión con correo y contraseña o restablece tu contraseña.',
          );
        }
        if (byEmail.googleId && byEmail.googleId !== googleId) {
          throw new ConflictException(
            'El correo ya está vinculado a otra cuenta de Google.',
          );
        }
        if (!byEmail.googleId) {
          await this.users.update(byEmail.id, { googleId });
        }
        user = await this.users.findById(byEmail.id);
        if (!user) {
          throw new UnauthorizedException('No se pudo completar el acceso.');
        }
      }
    }

    if (!user) {
      let referredByUserId: string | null = null;
      const rawRef = state.referral?.trim();
      if (rawRef) {
        const referrer = await this.users.findByReferralCode(rawRef);
        if (!referrer) {
          throw new ConflictException('Código de referido no válido');
        }
        if (referrer.email === email) {
          throw new ConflictException(
            'No puedes usar un código asociado a tu mismo correo',
          );
        }
        referredByUserId = referrer.id;
      }
      const role: UserRole | undefined =
        state.role === 'client'
          ? UserRole.Client
          : state.role === 'freelancer'
            ? UserRole.Freelancer
            : undefined;
      user = await this.users.create({
        email,
        googleId,
        passwordHash: null,
        fullName,
        role,
        referredByUserId,
        countryCode: countryCode ?? null,
        markEmailVerified: true,
      });
      if (referredByUserId) {
        await this.users.incrementReferralSlotsEarnedCapped(
          referredByUserId,
          REFERRAL_PUBLICATION_BONUS_CAP,
        );
      }
      if (user.role === UserRole.Freelancer) {
        await this.profiles.create({
          userId: user.id,
          displayName: freelancerDefaultDisplayName(user.fullName, user.email),
        });
      }
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Cuenta desactivada');
    }

    const tokens = this.tokens.issueTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    return {
      ...tokens,
      role: user.role,
      userId: user.id,
      redirectPath,
    };
  }
}
