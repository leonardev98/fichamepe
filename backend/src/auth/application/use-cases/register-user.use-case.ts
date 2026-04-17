import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';
import type { IUserRepository } from '../../../users/domain/repositories';
import { USER_REPOSITORY } from '../../../users/users.di-tokens';
import type {
  AuthTokens,
  IAuthTokenService,
} from '../../domain/services/auth-token.service.interface';
import { AUTH_TOKEN_SERVICE } from '../../auth.di-tokens';
import type { RegisterDto } from '../dto/register.dto';
import type { AuthenticatedUserResponse } from '../types/authenticated-user-response';
import { GetAuthenticatedUserUseCase } from './get-authenticated-user.use-case';
import { REFERRAL_PUBLICATION_BONUS_CAP } from '../../../common/publication/publication-slots';
import { VerificationMailService } from '../../../mail/verification-mail.service';

const EMAIL_VERIFY_TOKEN_TTL_MS = 48 * 60 * 60 * 1000;

export interface RegisterUserResult extends AuthTokens {
  user: AuthenticatedUserResponse;
}

type RegisterUserContext = {
  countryCode?: string | null;
};

@Injectable()
export class RegisterUserUseCase {
  private readonly logger = new Logger(RegisterUserUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
    @Inject(AUTH_TOKEN_SERVICE)
    private readonly tokens: IAuthTokenService,
    private readonly getAuthenticatedUser: GetAuthenticatedUserUseCase,
    private readonly verificationMail: VerificationMailService,
  ) {}

  async execute(
    dto: RegisterDto,
    context: RegisterUserContext = {},
  ): Promise<RegisterUserResult> {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('El correo ya está registrado');
    }
    let referredByUserId: string | null = null;
    const rawRef = dto.referralCode?.trim();
    if (rawRef) {
      const referrer = await this.users.findByReferralCode(rawRef);
      if (!referrer) {
        throw new BadRequestException('Código de referido no válido');
      }
      const emailNorm = dto.email.trim().toLowerCase();
      if (referrer.email === emailNorm) {
        throw new BadRequestException(
          'No puedes usar un código asociado a tu mismo correo',
        );
      }
      referredByUserId = referrer.id;
    }
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.users.create({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName?.trim() ? dto.fullName.trim() : null,
      role: dto.role,
      referredByUserId,
      countryCode: context.countryCode ?? null,
    });
    if (referredByUserId) {
      await this.users.incrementReferralSlotsEarnedCapped(
        referredByUserId,
        REFERRAL_PUBLICATION_BONUS_CAP,
      );
    }
    const verifyToken = randomBytes(32).toString('hex');
    const verifyExpires = new Date(Date.now() + EMAIL_VERIFY_TOKEN_TTL_MS);
    const verifySentAt = new Date();
    await this.users.setEmailVerificationByUserId(
      user.id,
      verifyToken,
      verifyExpires,
      verifySentAt,
    );
    try {
      await this.verificationMail.sendVerificationLink(user.email, verifyToken);
    } catch (e) {
      this.logger.warn(
        `No se pudo enviar el correo de verificación: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const tokens = this.tokens.issueTokens(tokenPayload);
    const me = await this.getAuthenticatedUser.execute(user.id);
    return { ...tokens, user: me };
  }
}
