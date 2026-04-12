import { ConfigService } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

function isTruthy(value: string | undefined): boolean {
  return value === '1' || value?.toLowerCase() === 'true' || value === 'yes';
}

/**
 * Sin Postgres: `DATABASE_USE_SQLITE=true` usa sql.js (sin binarios nativos; apto con pnpm que ignora scripts).
 * Con Postgres listo: `DATABASE_USE_SQLITE=false` (o elimina la variable) y `docker compose up -d` en la raíz del monorepo.
 */
export function buildTypeOrmOptions(
  configService: ConfigService,
): TypeOrmModuleOptions {
  if (isTruthy(configService.get<string>('DATABASE_USE_SQLITE'))) {
    return {
      type: 'sqljs',
      driver: require('sql.js'),
      autoLoadEntities: true,
      synchronize: true,
      logging: false,
      autoSave: false,
    };
  }

  return {
    type: 'postgres',
    host: configService.get<string>('DATABASE_HOST', 'localhost'),
    port: Number(configService.get<string>('DATABASE_PORT', '5432')),
    username: configService.get<string>('DATABASE_USER'),
    password: configService.get<string>('DATABASE_PASSWORD'),
    database: configService.get<string>('DATABASE_NAME'),
    autoLoadEntities: true,
    synchronize: false,
    retryAttempts: 5,
    retryDelay: 3000,
  };
}
