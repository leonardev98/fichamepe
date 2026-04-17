-- Safety net para entornos donde no se ejecutó 0023-notifications.sql
-- Idempotente: se puede ejecutar más de una vez sin romper.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS "notification" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "userId" uuid NOT NULL,
  "type" character varying(48) NOT NULL,
  "title" character varying(200) NOT NULL,
  "body" text,
  "linkPath" character varying(512),
  "readAt" timestamptz,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "PK_notification" PRIMARY KEY ("id"),
  CONSTRAINT "FK_notification_user"
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IDX_notification_user_created"
  ON "notification" ("userId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "IDX_notification_user_unread"
  ON "notification" ("userId")
  WHERE "readAt" IS NULL;
