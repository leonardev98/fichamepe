import { ConfigService } from '@nestjs/config';

/**
 * passport-jwt y jsonwebtoken fallan si el secreto es "";
 * ConfigService.getOrThrow no trata la cadena vacía como ausente.
 */
export function requireEnvSecret(config: ConfigService, key: string): string {
  const raw = config.get<string>(key);
  const value = raw?.trim();
  if (!value) {
    throw new Error(
      `${key} debe ser una cadena no vacía en el entorno (p. ej. backend/.env).`,
    );
  }
  return value;
}
