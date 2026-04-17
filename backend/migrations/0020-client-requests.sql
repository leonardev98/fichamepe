-- Solicitudes de clientes (brief + presupuesto) y postulaciones de freelancers.
-- Ejecutar en Postgres contra la misma base que TypeORM.

CREATE TABLE IF NOT EXISTS "client_request" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" uuid NOT NULL,
  "title" character varying(200) NOT NULL,
  "detail" text,
  "budget" character varying(120) NOT NULL,
  "status" character varying(16) NOT NULL DEFAULT 'OPEN',
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "FK_client_request_user"
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IDX_client_request_status_created"
  ON "client_request" ("status", "createdAt" DESC);

CREATE TABLE IF NOT EXISTS "client_request_application" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "requestId" uuid NOT NULL,
  "applicantUserId" uuid NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "FK_cra_request"
    FOREIGN KEY ("requestId") REFERENCES "client_request"("id") ON DELETE CASCADE,
  CONSTRAINT "FK_cra_applicant"
    FOREIGN KEY ("applicantUserId") REFERENCES "user"("id") ON DELETE CASCADE,
  CONSTRAINT "UQ_cra_request_applicant" UNIQUE ("requestId", "applicantUserId")
);

CREATE INDEX IF NOT EXISTS "IDX_cra_request" ON "client_request_application" ("requestId");
