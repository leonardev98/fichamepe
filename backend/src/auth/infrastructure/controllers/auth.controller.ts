import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { LoginDto } from '../../application/dto/login.dto';
import { RegisterDto } from '../../application/dto/register.dto';
import { RefreshTokenDto } from '../../application/dto/refresh-token.dto';
import { ForgotPasswordDto } from '../../application/dto/forgot-password.dto';
import { ResetPasswordDto } from '../../application/dto/reset-password.dto';
import { VerifyEmailBodyDto } from '../../application/dto/verify-email.dto';
import { CompletePasswordResetUseCase } from '../../application/use-cases/complete-password-reset.use-case';
import { GetAuthenticatedUserUseCase } from '../../application/use-cases/get-authenticated-user.use-case';
import { ResendVerificationEmailUseCase } from '../../application/use-cases/resend-verification-email.use-case';
import { RequestPasswordResetUseCase } from '../../application/use-cases/request-password-reset.use-case';
import { VerifyEmailUseCase } from '../../application/use-cases/verify-email.use-case';
import { LoginUserUseCase } from '../../application/use-cases/login-user.use-case';
import { RefreshTokensUseCase } from '../../application/use-cases/refresh-tokens.use-case';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';
import { CurrentUser } from '../decorators/current-user.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { JwtRefreshAuthGuard } from '../guards/jwt-refresh-auth.guard';
import type { RequestUser } from '../../domain/services/auth-token.service.interface';
import { extractRefreshTokenFromRequest } from '../utils/refresh-token.extractor';
import { AuthCookieService } from '../services/auth-cookie.service';
import { AuthAuditService } from '../services/auth-audit.service';
import {
  getRequestIp,
  getRequestUserAgent,
} from '../../../common/utils/request-metadata';
import { GoogleOAuthStartGuard } from '../guards/google-oauth-start.guard';
import { GoogleOAuthCallbackGuard } from '../guards/google-oauth-callback.guard';
import type { GoogleOAuthProfilePayload } from '../strategies/google.strategy';
import {
  decodeGoogleOAuthState,
  type GoogleOAuthStatePayload,
} from '../utils/google-oauth-state';
import { resolveOAuthFrontendBaseUrl } from '../utils/oauth-frontend-base-url';
import {
  AuthenticateWithGoogleUseCase,
  type AuthenticateWithGoogleResult,
} from '../../application/use-cases/authenticate-with-google.use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly config: ConfigService,
    private readonly registerUser: RegisterUserUseCase,
    private readonly loginUser: LoginUserUseCase,
    private readonly refreshTokens: RefreshTokensUseCase,
    private readonly getAuthenticatedUser: GetAuthenticatedUserUseCase,
    private readonly requestPasswordReset: RequestPasswordResetUseCase,
    private readonly completePasswordReset: CompletePasswordResetUseCase,
    private readonly verifyEmail: VerifyEmailUseCase,
    private readonly resendVerificationEmail: ResendVerificationEmailUseCase,
    private readonly authCookies: AuthCookieService,
    private readonly authAudit: AuthAuditService,
    private readonly authenticateWithGoogle: AuthenticateWithGoogleUseCase,
  ) {}

  @Get('google')
  @UseGuards(GoogleOAuthStartGuard)
  googleAuth(): void {
    /* Passport redirige a Google antes de ejecutar el cuerpo. */
  }

  @Get('google/callback')
  @UseGuards(GoogleOAuthCallbackGuard)
  async googleAuthCallback(
    @Req() req: Request,
    @Res({ passthrough: false }) res: Response,
  ) {
    const profile = req.user as GoogleOAuthProfilePayload;
    const rawState =
      typeof req.query['state'] === 'string' ? req.query['state'] : '';
    const feDefault = resolveOAuthFrontendBaseUrl(this.config, undefined);
    const loginWithGoogleError = () => {
      const login = new URL('/auth/login', `${feDefault}/`);
      login.searchParams.set('error', 'google');
      res.redirect(302, login.toString());
    };
    let state: GoogleOAuthStatePayload;
    try {
      state = decodeGoogleOAuthState(rawState);
    } catch {
      loginWithGoogleError();
      return;
    }
    const fe = resolveOAuthFrontendBaseUrl(this.config, state.returnOrigin);
    let tokens: AuthenticateWithGoogleResult;
    try {
      tokens = await this.authenticateWithGoogle.execute({
        googleId: profile.googleId,
        email: profile.email,
        fullName: profile.fullName,
        state,
      });
    } catch (e) {
      if (
        e instanceof ConflictException ||
        e instanceof BadRequestException ||
        e instanceof UnauthorizedException
      ) {
        loginWithGoogleError();
        return;
      }
      throw e;
    }
    this.authCookies.setAuthCookies(res, tokens.refreshToken, tokens.role);
    await this.authAudit.recordLoginEvent({
      userId: tokens.userId,
      ip: getRequestIp(req),
      userAgent: getRequestUserAgent(req),
    });
    const redirect = new URL('/auth/google/callback', `${fe}/`);
    redirect.searchParams.set('from', tokens.redirectPath);
    res.redirect(302, redirect.toString());
  }

  @Post('register')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60 * 1000 } })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, accessToken, user } =
      await this.registerUser.execute(dto);
    this.authCookies.setAuthCookies(res, refreshToken, user.role);
    await this.authAudit.recordLoginEvent({
      userId: user.id,
      ip: getRequestIp(req),
      userAgent: getRequestUserAgent(req),
    });
    return { accessToken, user };
  }

  @Post('verify-email')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 15, ttl: 60 * 1000 } })
  verifyEmailPost(@Body() dto: VerifyEmailBodyDto) {
    return this.verifyEmail.execute(dto.token);
  }

  @Post('resend-verification')
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60 * 1000 } })
  resendVerification(@CurrentUser() user: RequestUser) {
    return this.resendVerificationEmail.execute(user.userId);
  }

  @Post('forgot-password')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 60 * 1000 } })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.requestPasswordReset.execute(dto);
  }

  @Post('reset-password')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60 * 1000 } })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.completePasswordReset.execute(dto);
    return { ok: true as const };
  }

  @Post('login')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60 * 1000 } })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.loginUser.execute(dto);
    this.authCookies.setAuthCookies(res, tokens.refreshToken, tokens.role);
    await this.authAudit.recordLoginEvent({
      userId: tokens.userId,
      ip: getRequestIp(req),
      userAgent: getRequestUserAgent(req),
    });
    return { accessToken: tokens.accessToken };
  }

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  async refresh(
    @Req() req: Request,
    @CurrentUser() user: RequestUser,
    @Body() _body: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = extractRefreshTokenFromRequest(req);
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token requerido');
    }
    const tokens = await this.refreshTokens.execute(user.userId, refreshToken);
    this.authCookies.setAuthCookies(res, tokens.refreshToken, user.role);
    await this.authAudit.recordLoginEvent({
      userId: user.userId,
      ip: getRequestIp(req),
      userAgent: getRequestUserAgent(req),
    });
    return { accessToken: tokens.accessToken };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    this.authCookies.clearAuthCookies(res);
    return { ok: true as const };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: RequestUser) {
    return this.getAuthenticatedUser.execute(user.userId);
  }
}
