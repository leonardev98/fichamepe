-- Google OAuth: sub en "googleId"; usuarios solo-Google sin contraseña (password NULL).
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "googleId" character varying;

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_user_googleId"
  ON "user" ("googleId")
  WHERE "googleId" IS NOT NULL;

ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL;
