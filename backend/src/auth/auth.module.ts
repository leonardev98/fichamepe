import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
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
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { RefreshTokensUseCase } from './application/use-cases/refresh-tokens.use-case';
import { GetAuthenticatedUserUseCase } from './application/use-cases/get-authenticated-user.use-case';
import { AUTH_TOKEN_SERVICE } from './auth.di-tokens';

@Module({
  imports: [
    forwardRef(() => UsersModule),
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
    { provide: AUTH_TOKEN_SERVICE, useClass: NestJwtAuthTokenService },
    RegisterUserUseCase,
    LoginUserUseCase,
    RefreshTokensUseCase,
    GetAuthenticatedUserUseCase,
    JwtStrategy,
    JwtRefreshStrategy,
    JwtAuthGuard,
    JwtRefreshAuthGuard,
    RolesGuard,
  ],
  exports: [JwtAuthGuard, JwtRefreshAuthGuard, RolesGuard, AUTH_TOKEN_SERVICE],
})
export class AuthModule {}
