-- Postgres: ejecutar contra la base configurada en DATABASE_* cuando DATABASE_USE_SQLITE=false.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "fullName" character varying;
