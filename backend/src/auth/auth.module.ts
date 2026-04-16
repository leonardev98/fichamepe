import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { ServicesModule } from '../services/services.module';
import { MailModule } from '../mail/mail.module';
import { parseEnvDurationToSeconds } from './infrastructure/utils/parse-env-duration';
import { requireEnvSecret } from './infrastructure/utils/require-env-secret';
import { NestJwtAuthTokenService } from './infrastructure/jwt/nest-jwt-auth-token.service';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { JwtRefreshStrategy } from './infrastructure/strategies/jwt-refresh.strategy';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { JwtRefreshAuthGuard } from './infrastructure/guards/jwt-refresh-auth.guard';
import { RolesGuard } from './infrastructure/guards/roles.guard';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { AuthCookieService } from './infrastructure/services/auth-cookie.service';
import { AuthAuditService } from './infrastructure/services/auth-audit.service';
import { AuthLoginEventOrmEntity } from './infrastructure/persistence/entities/auth-login-event.orm';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { RefreshTokensUseCase } from './application/use-cases/refresh-tokens.use-case';
import { CompletePasswordResetUseCase } from './application/use-cases/complete-password-reset.use-case';
import { GetAuthenticatedUserUseCase } from './application/use-cases/get-authenticated-user.use-case';
import { RequestPasswordResetUseCase } from './application/use-cases/request-password-reset.use-case';
import { VerifyEmailUseCase } from './application/use-cases/verify-email.use-case';
import { ResendVerificationEmailUseCase } from './application/use-cases/resend-verification-email.use-case';
import { AuthenticateWithGoogleUseCase } from './application/use-cases/authenticate-with-google.use-case';
import { AUTH_TOKEN_SERVICE } from './auth.di-tokens';
import { GoogleStrategy } from './infrastructure/strategies/google.strategy';
import { GoogleOAuthStartGuard } from './infrastructure/guards/google-oauth-start.guard';
import { GoogleOAuthCallbackGuard } from './infrastructure/guards/google-oauth-callback.guard';

@Module({
  imports: [
    MailModule,
    forwardRef(() => UsersModule),
    forwardRef(() => ProfilesModule),
    forwardRef(() => ServicesModule),
    TypeOrmModule.forFeature([AuthLoginEventOrmEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: requireEnvSecret(configService, 'JWT_SECRET'),
        signOptions: {
          expiresIn: parseEnvDurationToSeconds(
            configService.get<string>('JWT_EXPIRES_IN'),
            15 * 60,
          ),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthCookieService,
    AuthAuditService,
    { provide: AUTH_TOKEN_SERVICE, useClass: NestJwtAuthTokenService },
    RegisterUserUseCase,
    LoginUserUseCase,
    RefreshTokensUseCase,
    GetAuthenticatedUserUseCase,
    RequestPasswordResetUseCase,
    CompletePasswordResetUseCase,
    VerifyEmailUseCase,
    ResendVerificationEmailUseCase,
    AuthenticateWithGoogleUseCase,
    GoogleStrategy,
    GoogleOAuthStartGuard,
    GoogleOAuthCallbackGuard,
    JwtStrategy,
    JwtRefreshStrategy,
    JwtAuthGuard,
    JwtRefreshAuthGuard,
    RolesGuard,
  ],
  exports: [
    JwtAuthGuard,
    JwtRefreshAuthGuard,
    RolesGuard,
    AUTH_TOKEN_SERVICE,
    JwtModule,
  ],
})
export class AuthModule {}
