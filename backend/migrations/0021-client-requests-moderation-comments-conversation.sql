-- Moderación de solicitudes, comentarios públicos, conversaciones ligadas a solicitud.
-- Ejecutar en Postgres después de 0020-client-requests.sql

-- ---------------------------------------------------------------------------
-- client_request: columnas de moderación
-- ---------------------------------------------------------------------------
ALTER TABLE "client_request"
  ADD COLUMN IF NOT EXISTS "submittedAt" timestamptz;
ALTER TABLE "client_request"
  ADD COLUMN IF NOT EXISTS "reviewedAt" timestamptz;
ALTER TABLE "client_request"
  ADD COLUMN IF NOT EXISTS "reviewedByUserId" uuid;
ALTER TABLE "client_request"
  ADD COLUMN IF NOT EXISTS "moderationComment" text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'FK_client_request_reviewed_by'
  ) THEN
    ALTER TABLE "client_request"
      ADD CONSTRAINT "FK_client_request_reviewed_by"
      FOREIGN KEY ("reviewedByUserId") REFERENCES "user"("id") ON DELETE SET NULL;
  END IF;
END $$;

UPDATE "client_request"
SET "submittedAt" = COALESCE("submittedAt", "createdAt")
WHERE "status" = 'OPEN' AND "submittedAt" IS NULL;

-- ---------------------------------------------------------------------------
-- client_request_comment
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "client_request_comment" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "clientRequestId" uuid NOT NULL,
  "userId" uuid NOT NULL,
  "body" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "FK_crc_request"
    FOREIGN KEY ("clientRequestId") REFERENCES "client_request"("id") ON DELETE CASCADE,
  CONSTRAINT "FK_crc_user"
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IDX_crc_request_created"
  ON "client_request_comment" ("clientRequestId", "createdAt" DESC);

-- ---------------------------------------------------------------------------
-- conversation: servicio XOR solicitud
-- ---------------------------------------------------------------------------
ALTER TABLE "conversation" ALTER COLUMN "serviceId" DROP NOT NULL;

ALTER TABLE "conversation"
  ADD COLUMN IF NOT EXISTS "clientRequestId" uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'FK_conversation_client_request'
  ) THEN
    ALTER TABLE "conversation"
      ADD CONSTRAINT "FK_conversation_client_request"
      FOREIGN KEY ("clientRequestId") REFERENCES "client_request"("id") ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CHK_conversation_service_xor_request'
  ) THEN
    ALTER TABLE "conversation"
      ADD CONSTRAINT "CHK_conversation_service_xor_request"
      CHECK (
        ("serviceId" IS NOT NULL AND "clientRequestId" IS NULL)
        OR ("serviceId" IS NULL AND "clientRequestId" IS NOT NULL)
      );
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_conversation_client_request_buyer"
  ON "conversation" ("clientRequestId", "buyerUserId")
  WHERE "clientRequestId" IS NOT NULL;
