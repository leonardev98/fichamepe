-- Reportes unificados + ocultar comentarios; migración desde service_report.
-- Ejecutar después de 0021.

-- ---------------------------------------------------------------------------
-- Comentarios de solicitud: ocultar por moderación
-- ---------------------------------------------------------------------------
ALTER TABLE "client_request_comment"
  ADD COLUMN IF NOT EXISTS "moderationHiddenAt" timestamptz;

-- ---------------------------------------------------------------------------
-- moderation_report
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "moderation_report" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "targetType" character varying(32) NOT NULL,
  "targetId" uuid NOT NULL,
  "reporterUserId" uuid NOT NULL,
  "reason" character varying(40) NOT NULL,
  "details" character varying(1000),
  "reviewStatus" character varying(16) NOT NULL DEFAULT 'pending',
  "reviewedAt" timestamptz,
  "reviewedByUserId" uuid,
  "reviewNote" text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "FK_moderation_report_reporter"
    FOREIGN KEY ("reporterUserId") REFERENCES "user"("id") ON DELETE CASCADE,
  CONSTRAINT "FK_moderation_report_reviewed_by"
    FOREIGN KEY ("reviewedByUserId") REFERENCES "user"("id") ON DELETE SET NULL,
  CONSTRAINT "UQ_moderation_report_reporter_target"
    UNIQUE ("reporterUserId", "targetType", "targetId")
);

CREATE INDEX IF NOT EXISTS "IDX_moderation_report_status_created"
  ON "moderation_report" ("reviewStatus", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "IDX_moderation_report_target"
  ON "moderation_report" ("targetType", "targetId");

-- Datos históricos desde service_report (solo si esa tabla existe; p. ej. Supabase fresh no la crea)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'service_report'
  ) THEN
    EXECUTE $migrate$
      INSERT INTO "moderation_report" (
        "targetType",
        "targetId",
        "reporterUserId",
        "reason",
        "details",
        "reviewStatus",
        "createdAt",
        "updatedAt"
      )
      SELECT DISTINCT ON (sr."reporterUserId", sr."serviceId")
        'service',
        sr."serviceId",
        sr."reporterUserId",
        sr."reason",
        sr."details",
        'pending',
        sr."createdAt"::timestamptz,
        sr."createdAt"::timestamptz
      FROM "service_report" sr
      ORDER BY sr."reporterUserId", sr."serviceId", sr."createdAt" DESC
      ON CONFLICT ("reporterUserId", "targetType", "targetId") DO NOTHING
    $migrate$;
  END IF;
END $$;
