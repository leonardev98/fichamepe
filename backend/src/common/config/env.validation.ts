import { plainToInstance, Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
  validateSync,
} from 'class-validator';

/** Postgres solo si no usamos SQLite en memoria. */
function usePostgresDb(o: EnvironmentVariables): boolean {
  const raw = o.DATABASE_USE_SQLITE;
  const sqlite =
    raw === '1' ||
    raw === 'yes' ||
    String(raw ?? '').toLowerCase() === 'true';
  return !sqlite;
}

function emptyToUndefined({ value }: { value: unknown }): unknown {
  if (value === '' || value === null) return undefined;
  return value;
}

class EnvironmentVariables {
  @IsOptional()
  @IsString()
  DATABASE_USE_SQLITE?: string;

  @ValidateIf(usePostgresDb)
  @IsString()
  @IsNotEmpty()
  DATABASE_HOST?: string;

  @ValidateIf(usePostgresDb)
  @IsString()
  @IsNotEmpty()
  DATABASE_PORT?: string;

  @ValidateIf(usePostgresDb)
  @IsString()
  @IsNotEmpty()
  DATABASE_USER?: string;

  @ValidateIf(usePostgresDb)
  @IsString()
  @IsNotEmpty()
  DATABASE_PASSWORD?: string;

  @ValidateIf(usePostgresDb)
  @IsString()
  @IsNotEmpty()
  DATABASE_NAME?: string;

  /** true = SSL explícito (Postgres remoto). Si el host es *.supabase.co, SSL se activa solo. */
  @IsOptional()
  @IsString()
  DATABASE_SSL?: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET!: string;

  /** Opcional hasta integrar S3; si falta alguna, el servicio de uploads no firmará URLs. */
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  AWS_REGION?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  AWS_ACCESS_KEY_ID?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  AWS_SECRET_ACCESS_KEY?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  AWS_S3_BUCKET?: string;

  /** Lista separada por comas; siempre incluye leonardpostillos@gmail.com en lógica de cupo. */
  @IsOptional()
  @IsString()
  REFERRAL_PUBLISH_EXEMPT_EMAILS?: string;

  /** URL del frontend (enlaces en correos de verificación). */
  @IsOptional()
  @IsString()
  FRONTEND_URL?: string;

  /** API key de Resend; si falta, el backend solo registra el enlace en logs. */
  @IsOptional()
  @IsString()
  RESEND_API_KEY?: string;

  /** Remitente verificado en Resend (ej. `Equipo <noreply@tudominio.com>`). */
  @IsOptional()
  @IsString()
  MAIL_FROM?: string;

  /** OAuth Google: las tres deben estar definidas para habilitar el flujo. */
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  GOOGLE_CLIENT_ID?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  GOOGLE_CLIENT_SECRET?: string;

  /** URL exacta autorizada en Google Cloud (ej. https://api.tudominio.com/auth/google/callback). */
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  GOOGLE_CALLBACK_URL?: string;
}

function formatValidationErrors(
  errors: ReturnType<typeof validateSync>,
): string {
  return errors
    .map((e) => {
      const props = e.property;
      const constraints = e.constraints
        ? Object.values(e.constraints).join(', ')
        : 'valor inválido';
      return `${props}: ${constraints}`;
    })
    .join('; ');
}

/**
 * Valida variables obligatorias al arranque. Devuelve el config original
 * para no eliminar claves extra (p. ej. DATABASE_USE_SQLITE).
 */
export function validateEnv(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, {
    skipMissingProperties: false,
    forbidUnknownValues: false,
  });
  if (errors.length > 0) {
    throw new Error(
      `Variables de entorno inválidas o faltantes: ${formatValidationErrors(errors)}`,
    );
  }
  return config;
}
