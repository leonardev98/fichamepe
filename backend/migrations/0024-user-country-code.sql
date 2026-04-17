-- País detectado/preferido del usuario (ISO-3166-1 alpha-2)
-- Ejecutar después de 0023.

ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS "countryCode" char(2);

ALTER TABLE "user"
  DROP CONSTRAINT IF EXISTS "CHK_user_countryCode_format";

ALTER TABLE "user"
  ADD CONSTRAINT "CHK_user_countryCode_format"
  CHECK ("countryCode" IS NULL OR "countryCode" ~ '^[A-Z]{2}$');
