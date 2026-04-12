function pick(key: string, fallback: string): string {
  const v = process.env[key];
  return v && String(v).trim() !== '' ? v : fallback;
}

Object.assign(process.env, {
  DATABASE_HOST: pick('DATABASE_HOST', 'localhost'),
  DATABASE_PORT: pick('DATABASE_PORT', '5432'),
  DATABASE_USER: pick('DATABASE_USER', 'test'),
  DATABASE_PASSWORD: pick('DATABASE_PASSWORD', 'test'),
  DATABASE_NAME: pick('DATABASE_NAME', 'test'),
  JWT_SECRET: pick(
    'JWT_SECRET',
    'e2e-access-secret-at-least-32-chars-long-value',
  ),
  JWT_REFRESH_SECRET: pick(
    'JWT_REFRESH_SECRET',
    'e2e-refresh-secret-at-least-32-chars-long-value',
  ),
  AWS_REGION: pick('AWS_REGION', 'us-east-1'),
  AWS_ACCESS_KEY_ID: pick('AWS_ACCESS_KEY_ID', 'test'),
  AWS_SECRET_ACCESS_KEY: pick('AWS_SECRET_ACCESS_KEY', 'test'),
  AWS_S3_BUCKET: pick('AWS_S3_BUCKET', 'test-bucket'),
  DATABASE_USE_SQLITE: pick('DATABASE_USE_SQLITE', 'true'),
});
