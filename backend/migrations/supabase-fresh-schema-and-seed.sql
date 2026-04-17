-- Supabase / Postgres: esquema alineado con el backend (TypeORM) + datos demo.
-- Ejecutar en el SQL Editor de Supabase (o psql) sobre la base del proyecto.
-- Orden: DROP → CREATE → INSERT.

BEGIN;

-- ---------------------------------------------------------------------------
-- LIMPIEZA (orden: hijos primero por FK)
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS "notification" CASCADE;
DROP TABLE IF EXISTS "moderation_report" CASCADE;
DROP TABLE IF EXISTS "publication_slot_purchase" CASCADE;
DROP TABLE IF EXISTS "token_transactions" CASCADE;
DROP TABLE IF EXISTS "subscriptions" CASCADE;
DROP TABLE IF EXISTS "client_request_comment" CASCADE;
DROP TABLE IF EXISTS "client_request_application" CASCADE;
DROP TABLE IF EXISTS "client_request" CASCADE;
DROP TABLE IF EXISTS "conversation_message" CASCADE;
DROP TABLE IF EXISTS "conversation" CASCADE;
DROP TABLE IF EXISTS "service_review" CASCADE;
DROP TABLE IF EXISTS "service" CASCADE;
DROP TABLE IF EXISTS "profile_skills" CASCADE;
DROP TABLE IF EXISTS "profile" CASCADE;
DROP TABLE IF EXISTS "skills" CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;

-- ---------------------------------------------------------------------------
-- TABLAS (nombres en singular: "user", "profile", "service" — como las entidades)
-- ---------------------------------------------------------------------------

CREATE TABLE "user" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "email" character varying NOT NULL,
  "fullName" character varying,
  "password" character varying,
  "googleId" character varying,
  "role" character varying(32) NOT NULL DEFAULT 'freelancer',
  "isActive" boolean NOT NULL DEFAULT true,
  "isPro" boolean NOT NULL DEFAULT false,
  "proExpiresAt" TIMESTAMP,
  "tokenBalance" integer NOT NULL DEFAULT 0,
  "passwordResetToken" character varying,
  "passwordResetExpires" TIMESTAMP,
  "emailVerifiedAt" TIMESTAMP WITH TIME ZONE,
  "emailVerificationToken" character varying,
  "emailVerificationExpires" TIMESTAMP WITH TIME ZONE,
  "emailVerificationLastSentAt" TIMESTAMP WITH TIME ZONE,
  "referralCode" character varying(16) NOT NULL,
  "referredByUserId" uuid,
  "referralMigrationCredits" integer NOT NULL DEFAULT 0,
  "referralSlotsEarned" integer NOT NULL DEFAULT 0,
  "purchasedPublicationSlots" integer NOT NULL DEFAULT 0,
  "countryCode" char(2),
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_user" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_user_email" UNIQUE ("email"),
  CONSTRAINT "UQ_user_googleId" UNIQUE ("googleId"),
  CONSTRAINT "UQ_user_referralCode" UNIQUE ("referralCode"),
  CONSTRAINT "CHK_user_countryCode_format"
    CHECK ("countryCode" IS NULL OR "countryCode" ~ '^[A-Z]{2}$'),
  CONSTRAINT "FK_user_referredByUser" FOREIGN KEY ("referredByUserId") REFERENCES "user"("id") ON DELETE SET NULL
);

CREATE INDEX "IDX_user_referredByUserId" ON "user" ("referredByUserId");

CREATE TABLE "skills" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" character varying NOT NULL,
  "category" character varying NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_skills" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_skills_name" UNIQUE ("name")
);

CREATE TABLE "profile" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "displayName" character varying NOT NULL,
  "bio" text,
  "avatarUrl" character varying,
  "district" character varying,
  "whatsappNumber" character varying,
  "portfolioImages" text,
  "hourlyRate" numeric(10, 2),
  "isAvailable" boolean NOT NULL DEFAULT true,
  "userId" uuid NOT NULL,
  CONSTRAINT "PK_profile" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_profile_userId" UNIQUE ("userId"),
  CONSTRAINT "FK_profile_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE "profile_skills" (
  "profileId" uuid NOT NULL,
  "skillId" uuid NOT NULL,
  CONSTRAINT "PK_profile_skills" PRIMARY KEY ("profileId", "skillId"),
  CONSTRAINT "FK_profile_skills_profile" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE CASCADE,
  CONSTRAINT "FK_profile_skills_skill" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE
);

CREATE TABLE "service" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "title" character varying(80) NOT NULL,
  "description" character varying(600) NOT NULL,
  "price" numeric(10, 2),
  "currency" character varying(3) NOT NULL DEFAULT 'PEN',
  "coverImageUrl" character varying,
  "isFeatured" boolean NOT NULL DEFAULT false,
  "status" character varying(16) NOT NULL DEFAULT 'BORRADOR',
  "viewCount" integer NOT NULL DEFAULT 0,
  "tags" text,
  "category" character varying(40) NOT NULL DEFAULT 'other',
  "deliveryMode" character varying(32) NOT NULL DEFAULT 'digital',
  "deliveryTime" character varying(40) NOT NULL DEFAULT 'A coordinar',
  "revisionsIncluded" character varying(16) NOT NULL DEFAULT '0',
  "listPrice" numeric(10, 2),
  "promoEndsAt" timestamptz,
  "profileId" uuid NOT NULL,
  "userId" uuid NOT NULL,
  "reviewCount" integer NOT NULL DEFAULT 0,
  "reviewAverage" numeric(3, 1) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_service" PRIMARY KEY ("id"),
  CONSTRAINT "FK_service_profile" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE CASCADE,
  CONSTRAINT "FK_service_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE INDEX "IDX_service_status" ON "service" ("status");
CREATE INDEX "IDX_service_is_featured" ON "service" ("isFeatured");
CREATE INDEX "IDX_service_view_count" ON "service" ("viewCount");
CREATE INDEX "IDX_service_created_at" ON "service" ("createdAt");

CREATE TABLE "publication_slot_purchase" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "userId" uuid NOT NULL,
  "kind" character varying(16) NOT NULL,
  "slotsGranted" integer NOT NULL,
  "amountPen" numeric(10, 2) NOT NULL,
  "status" character varying(24) NOT NULL DEFAULT 'pending_payment',
  "paymentReference" character varying(255),
  "fulfilledByUserId" uuid,
  "fulfilledAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_publication_slot_purchase" PRIMARY KEY ("id"),
  CONSTRAINT "FK_publication_slot_purchase_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE,
  CONSTRAINT "FK_publication_slot_purchase_fulfilledBy" FOREIGN KEY ("fulfilledByUserId") REFERENCES "user"("id") ON DELETE SET NULL
);

CREATE INDEX "IDX_publication_slot_purchase_userId" ON "publication_slot_purchase" ("userId");
CREATE INDEX "IDX_publication_slot_purchase_status" ON "publication_slot_purchase" ("status");

CREATE TABLE "client_request" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "userId" uuid NOT NULL,
  "title" character varying(200) NOT NULL,
  "detail" text,
  "budget" character varying(120) NOT NULL,
  "status" character varying(16) NOT NULL DEFAULT 'EN_REVISION',
  "submittedAt" timestamptz,
  "reviewedAt" timestamptz,
  "reviewedByUserId" uuid,
  "moderationComment" text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "PK_client_request" PRIMARY KEY ("id"),
  CONSTRAINT "FK_client_request_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE,
  CONSTRAINT "FK_client_request_reviewed_by" FOREIGN KEY ("reviewedByUserId") REFERENCES "user"("id") ON DELETE SET NULL
);

CREATE INDEX "IDX_client_request_status_created" ON "client_request" ("status", "createdAt" DESC);

CREATE TABLE "client_request_application" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "requestId" uuid NOT NULL,
  "applicantUserId" uuid NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "PK_client_request_application" PRIMARY KEY ("id"),
  CONSTRAINT "FK_cra_request" FOREIGN KEY ("requestId") REFERENCES "client_request"("id") ON DELETE CASCADE,
  CONSTRAINT "FK_cra_applicant" FOREIGN KEY ("applicantUserId") REFERENCES "user"("id") ON DELETE CASCADE,
  CONSTRAINT "UQ_cra_request_applicant" UNIQUE ("requestId", "applicantUserId")
);

CREATE INDEX "IDX_cra_request" ON "client_request_application" ("requestId");

CREATE TABLE "client_request_comment" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "clientRequestId" uuid NOT NULL,
  "userId" uuid NOT NULL,
  "body" text NOT NULL,
  "moderationHiddenAt" timestamptz,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "PK_client_request_comment" PRIMARY KEY ("id"),
  CONSTRAINT "FK_crc_request" FOREIGN KEY ("clientRequestId") REFERENCES "client_request"("id") ON DELETE CASCADE,
  CONSTRAINT "FK_crc_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE INDEX "IDX_crc_request_created" ON "client_request_comment" ("clientRequestId", "createdAt" DESC);

CREATE TABLE "conversation" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "serviceId" uuid,
  "clientRequestId" uuid,
  "sellerUserId" uuid NOT NULL,
  "buyerUserId" uuid NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "PK_conversation" PRIMARY KEY ("id"),
  CONSTRAINT "FK_conversation_service" FOREIGN KEY ("serviceId") REFERENCES "service"("id") ON DELETE CASCADE,
  CONSTRAINT "FK_conversation_client_request" FOREIGN KEY ("clientRequestId") REFERENCES "client_request"("id") ON DELETE CASCADE,
  CONSTRAINT "FK_conversation_seller" FOREIGN KEY ("sellerUserId") REFERENCES "user"("id") ON DELETE CASCADE,
  CONSTRAINT "FK_conversation_buyer" FOREIGN KEY ("buyerUserId") REFERENCES "user"("id") ON DELETE CASCADE,
  CONSTRAINT "CHK_conversation_service_xor_request" CHECK (
    ("serviceId" IS NOT NULL AND "clientRequestId" IS NULL)
    OR ("serviceId" IS NULL AND "clientRequestId" IS NOT NULL)
  )
);

CREATE UNIQUE INDEX "UQ_conversation_service_buyer" ON "conversation" ("serviceId", "buyerUserId")
  WHERE "serviceId" IS NOT NULL;
CREATE UNIQUE INDEX "UQ_conversation_client_request_buyer" ON "conversation" ("clientRequestId", "buyerUserId")
  WHERE "clientRequestId" IS NOT NULL;

CREATE INDEX "IDX_conversation_seller" ON "conversation" ("sellerUserId");
CREATE INDEX "IDX_conversation_buyer" ON "conversation" ("buyerUserId");
CREATE INDEX "IDX_conversation_updated" ON "conversation" ("updatedAt");

CREATE TABLE "conversation_message" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "conversationId" uuid NOT NULL,
  "senderUserId" uuid NOT NULL,
  "body" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "PK_conversation_message" PRIMARY KEY ("id"),
  CONSTRAINT "FK_conversation_message_conversation" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE CASCADE,
  CONSTRAINT "FK_conversation_message_sender" FOREIGN KEY ("senderUserId") REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE INDEX "IDX_conversation_message_conversation_created" ON "conversation_message" ("conversationId", "createdAt");

CREATE TABLE "service_review" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "serviceId" uuid NOT NULL,
  "authorUserId" uuid NOT NULL,
  "rating" smallint NOT NULL,
  "body" text NOT NULL,
  "isVerifiedPurchase" boolean NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_service_review" PRIMARY KEY ("id"),
  CONSTRAINT "FK_service_review_service" FOREIGN KEY ("serviceId") REFERENCES "service"("id") ON DELETE CASCADE,
  CONSTRAINT "FK_service_review_author" FOREIGN KEY ("authorUserId") REFERENCES "user"("id") ON DELETE CASCADE,
  CONSTRAINT "CHK_service_review_rating" CHECK ("rating" >= 1 AND "rating" <= 5),
  CONSTRAINT "UQ_service_review_service_author" UNIQUE ("serviceId", "authorUserId")
);

CREATE INDEX "IDX_service_review_service_created" ON "service_review" ("serviceId", "createdAt" DESC);

CREATE TABLE "moderation_report" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
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
  CONSTRAINT "PK_moderation_report" PRIMARY KEY ("id"),
  CONSTRAINT "FK_moderation_report_reporter" FOREIGN KEY ("reporterUserId") REFERENCES "user"("id") ON DELETE CASCADE,
  CONSTRAINT "FK_moderation_report_reviewed_by" FOREIGN KEY ("reviewedByUserId") REFERENCES "user"("id") ON DELETE SET NULL,
  CONSTRAINT "UQ_moderation_report_reporter_target" UNIQUE ("reporterUserId", "targetType", "targetId")
);

CREATE INDEX "IDX_moderation_report_status_created" ON "moderation_report" ("reviewStatus", "createdAt" DESC);
CREATE INDEX "IDX_moderation_report_target" ON "moderation_report" ("targetType", "targetId");

CREATE TABLE "subscriptions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "userId" uuid NOT NULL,
  "plan" character varying(32) NOT NULL,
  "status" character varying(32) NOT NULL,
  "amount" numeric(10, 2) NOT NULL,
  "paymentMethod" character varying,
  "paymentReference" character varying,
  "activatedAt" TIMESTAMP,
  "expiresAt" TIMESTAMP,
  "activatedBy" character varying,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_subscriptions" PRIMARY KEY ("id"),
  CONSTRAINT "FK_subscriptions_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE "token_transactions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "fromUserId" uuid,
  "toUserId" uuid NOT NULL,
  "amount" integer NOT NULL,
  "type" character varying(32) NOT NULL,
  "status" character varying(32) NOT NULL DEFAULT 'pending',
  "metadata" text,
  "respondedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_token_transactions" PRIMARY KEY ("id"),
  CONSTRAINT "FK_token_from_user" FOREIGN KEY ("fromUserId") REFERENCES "user"("id") ON DELETE SET NULL,
  CONSTRAINT "FK_token_to_user" FOREIGN KEY ("toUserId") REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE "notification" (
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

CREATE INDEX "IDX_notification_user_created"
  ON "notification" ("userId", "createdAt" DESC);

CREATE INDEX "IDX_notification_user_unread"
  ON "notification" ("userId")
  WHERE "readAt" IS NULL;

-- ---------------------------------------------------------------------------
-- DATOS DEMO (usuarios → perfiles → servicios)
-- ---------------------------------------------------------------------------

INSERT INTO "user" ("id", "email", "password", "role", "isActive", "isPro", "tokenBalance", "referralCode", "referredByUserId", "referralMigrationCredits", "referralSlotsEarned", "purchasedPublicationSlots", "emailVerifiedAt", "createdAt", "updatedAt") VALUES
('a1b2c3d4-0001-0001-0001-000000000001', 'juan.comediante@gmail.com', '$2b$10$placeholder', 'freelancer', true, true, 10, 'DEMOJUAN01', NULL, 0, 0, 0, now(), now(), now()),
('a1b2c3d4-0002-0002-0002-000000000002', 'maria.diseno@gmail.com', '$2b$10$placeholder', 'freelancer', true, false, 5, 'DEMOMARIA02', NULL, 0, 0, 0, now(), now(), now()),
('a1b2c3d4-0003-0003-0003-000000000003', 'carlos.profe@gmail.com', '$2b$10$placeholder', 'freelancer', true, true, 8, 'DEMOCARLOS3', NULL, 0, 0, 0, now(), now(), now()),
('a1b2c3d4-0004-0004-0004-000000000004', 'lucia.community@gmail.com', '$2b$10$placeholder', 'freelancer', true, false, 3, 'DEMOLUCIA04', NULL, 0, 0, 0, now(), now(), now()),
('a1b2c3d4-0005-0005-0005-000000000005', 'pedro.streamer@gmail.com', '$2b$10$placeholder', 'freelancer', true, true, 12, 'DEMOPEDRO05', NULL, 0, 0, 0, now(), now(), now()),
('a1b2c3d4-0006-0006-0006-000000000006', 'ana.hater@gmail.com', '$2b$10$placeholder', 'freelancer', true, false, 6, 'DEMOANA006', NULL, 0, 0, 0, now(), now(), now()),
('a1b2c3d4-0007-0007-0007-000000000007', 'diego.video@gmail.com', '$2b$10$placeholder', 'freelancer', true, true, 9, 'DEMODIEGO07', NULL, 0, 0, 0, now(), now(), now()),
('a1b2c3d4-0008-0008-0008-000000000008', 'sofia.abogada@gmail.com', '$2b$10$placeholder', 'freelancer', true, false, 4, 'DEMOSOFIA08', NULL, 0, 0, 0, now(), now(), now()),
('a1b2c3d4-0009-0009-0009-000000000009', 'miguel.musico@gmail.com', '$2b$10$placeholder', 'freelancer', true, true, 7, 'DEMOMIGUEL9', NULL, 0, 0, 0, now(), now(), now()),
('a1b2c3d4-0010-0010-0010-000000000010', 'valeria.coach@gmail.com', '$2b$10$placeholder', 'freelancer', true, false, 2, 'DEMOVALER10', NULL, 0, 0, 0, now(), now(), now()),
('a1b2c3d4-0011-0011-0011-000000000011', 'renzo.animador@gmail.com', '$2b$10$placeholder', 'freelancer', true, true, 15, 'DEMORENZO11', NULL, 0, 0, 0, now(), now(), now()),
('a1b2c3d4-0012-0012-0012-000000000012', 'camila.excel@gmail.com', '$2b$10$placeholder', 'freelancer', true, false, 5, 'DEMOCAMIL12', NULL, 0, 0, 0, now(), now(), now());

INSERT INTO "profile" ("id", "displayName", "bio", "district", "whatsappNumber", "hourlyRate", "isAvailable", "userId") VALUES
('b1b2c3d4-0001-0001-0001-000000000001', 'Juan el Comediante', 'Hago reír a equipos aburridos por Meet. 5 años haciendo stand-up en Lima.', 'Miraflores', '51999000001', 80, true, 'a1b2c3d4-0001-0001-0001-000000000001'),
('b1b2c3d4-0002-0002-0002-000000000002', 'María Diseños', 'Diseñadora gráfica obsesionada con el detalle. Posts de IG que la gente guarda.', 'San Isidro', '51999000002', 60, true, 'a1b2c3d4-0002-0002-0002-000000000002'),
('b1b2c3d4-0003-0003-0003-000000000003', 'Carlos Profesor', 'Enseño lo que sea con ejemplos reales. Matemáticas, Excel, programación.', 'Surco', '51999000003', 50, true, 'a1b2c3d4-0003-0003-0003-000000000003'),
('b1b2c3d4-0004-0004-0004-000000000004', 'Lucía Community', 'Doy vida a páginas de Facebook muertas. Engagement real, no bots.', 'Barranco', '51999000004', 45, true, 'a1b2c3d4-0004-0004-0004-000000000004'),
('b1b2c3d4-0005-0005-0005-000000000005', 'Pedro Stream', 'Streamer con 50k seguidores. Te enseño a monetizar desde cero en Twitch.', 'La Molina', '51999000005', 120, true, 'a1b2c3d4-0005-0005-0005-000000000005'),
('b1b2c3d4-0006-0006-0006-000000000006', 'Ana la Hater', 'Soy tu hater profesional. Te digo todo lo malo de tu producto antes que tus clientes.', 'Jesus Maria', '51999000006', 90, true, 'a1b2c3d4-0006-0006-0006-000000000006'),
('b1b2c3d4-0007-0007-0007-000000000007', 'Diego Audiovisual', 'Edito videos que la gente ve hasta el final. TikTok, Reels, YouTube.', 'Lince', '51999000007', 70, true, 'a1b2c3d4-0007-0007-0007-000000000007'),
('b1b2c3d4-0008-0008-0008-000000000008', 'Sofia Abogada', 'Abogada freelance. Reviso tu contrato antes de que lo firmes y te arrepientas.', 'San Borja', '51999000008', 100, true, 'a1b2c3d4-0008-0008-0008-000000000008'),
('b1b2c3d4-0009-0009-0009-000000000009', 'Miguel Musico', 'Productor musical y guitarrista. Clases, composicion y grabacion desde mi estudio.', 'Pueblo Libre', '51999000009', 65, true, 'a1b2c3d4-0009-0009-0009-000000000009'),
('b1b2c3d4-0010-0010-0010-000000000010', 'Valeria Coach', 'Coach de emprendimiento. Te ayudo a dejar de procrastinar y lanzar tu negocio.', 'Miraflores', '51999000010', 85, true, 'a1b2c3d4-0010-0010-0010-000000000010'),
('b1b2c3d4-0011-0011-0011-000000000011', 'Renzo el Animador', 'Animador de fiestas, eventos corporativos y cumpleanos virtuales. El ambiente lo pongo yo.', 'San Miguel', '51999000011', 150, true, 'a1b2c3d4-0011-0011-0011-000000000011'),
('b1b2c3d4-0012-0012-0012-000000000012', 'Camila Excel Queen', 'Domino Excel como nadie. Te enseno a automatizar tu trabajo en 2 horas.', 'Surquillo', '51999000012', 55, true, 'a1b2c3d4-0012-0012-0012-000000000012');

INSERT INTO "service" ("id", "title", "description", "price", "currency", "status", "viewCount", "tags", "category", "deliveryMode", "deliveryTime", "revisionsIncluded", "profileId", "userId") VALUES
('c1000001-0001-0001-0001-000000000001', 'Hago reir a tu equipo por videollamada en 20 minutos', 'Soy comediante y animo reuniones de trabajo aburridas. Tu equipo se va a acordar de esa call para siempre.', 80, 'PEN', 'ACTIVA', 245, 'humor,teams,entretenimiento', 'other', 'digital', 'A coordinar', '0', 'b1b2c3d4-0001-0001-0001-000000000001', 'a1b2c3d4-0001-0001-0001-000000000001'),
('c1000001-0002-0002-0002-000000000002', 'Diseno 10 posts para tu Instagram en 48 horas', 'Feed bonito, coherente y tuyo. Sin templates genericos de Canva que ya todo el mundo tiene.', 150, 'PEN', 'ACTIVA', 312, 'diseno,instagram,redes sociales', 'other', 'digital', 'A coordinar', '0', 'b1b2c3d4-0002-0002-0002-000000000002', 'a1b2c3d4-0002-0002-0002-000000000002'),
('c1000001-0003-0003-0003-000000000003', 'Te enseno Excel con los datos de tu propio negocio', 'Nada de tutoriales genericos. Traes tus datos, yo te enseno a dominarlos en 2 horas.', 60, 'PEN', 'ACTIVA', 189, 'excel,clases,negocio', 'other', 'digital', 'A coordinar', '0', 'b1b2c3d4-0003-0003-0003-000000000003', 'a1b2c3d4-0003-0003-0003-000000000003'),
('c1000001-0004-0004-0004-000000000004', 'Comento y doy vida a tu pagina de Facebook por 7 dias', 'Respondo comentarios, creo conversacion real y subo el engagement de tu pagina como si fuera mia.', 120, 'PEN', 'ACTIVA', 98, 'facebook,comunidad,redes sociales', 'other', 'digital', 'A coordinar', '0', 'b1b2c3d4-0004-0004-0004-000000000004', 'a1b2c3d4-0004-0004-0004-000000000004'),
('c1000001-0005-0005-0005-000000000005', 'Te enseno a monetizar tu canal de Twitch desde cero', 'Tengo 50k seguidores y se exactamente que funciona y que no. En 3 sesiones tienes tu estrategia completa.', 120, 'PEN', 'ACTIVA', 421, 'streaming,twitch,monetizacion', 'other', 'digital', 'A coordinar', '0', 'b1b2c3d4-0005-0005-0005-000000000005', 'a1b2c3d4-0005-0005-0005-000000000005'),
('c1000001-0006-0006-0006-000000000006', 'Soy tu hater profesional: te digo todo lo malo de tu negocio', 'Antes de que tus clientes te destruyan en redes, yo te digo exactamente que esta mal en tu producto.', 90, 'PEN', 'ACTIVA', 534, 'feedback,negocio,consultoria', 'other', 'digital', 'A coordinar', '0', 'b1b2c3d4-0006-0006-0006-000000000006', 'a1b2c3d4-0006-0006-0006-000000000006'),
('c1000001-0007-0007-0007-000000000007', 'Edito tu TikTok o Reels para que la gente lo vea hasta el final', 'Corto, agrego texto, musica y efectos. Entrega en 24h con 3 versiones distintas.', 70, 'PEN', 'ACTIVA', 287, 'video,tiktok,edicion', 'other', 'digital', 'A coordinar', '0', 'b1b2c3d4-0007-0007-0007-000000000007', 'a1b2c3d4-0007-0007-0007-000000000007'),
('c1000001-0008-0008-0008-000000000008', 'Reviso tu contrato antes de que lo firmes y te arrepientas', 'Soy abogada freelance. Te explico en palabras normales que dice ese contrato. Respuesta en menos de 24h.', 100, 'PEN', 'ACTIVA', 156, 'legal,contratos,asesoria', 'other', 'digital', 'A coordinar', '0', 'b1b2c3d4-0008-0008-0008-000000000008', 'a1b2c3d4-0008-0008-0008-000000000008'),
('c1000001-0009-0009-0009-000000000009', 'Clases de guitarra para adultos que nunca aprendieron', 'Sin juicio, sin escalas interminables. En 4 clases tocas tu primera cancion completa.', 65, 'PEN', 'ACTIVA', 203, 'musica,guitarra,clases', 'other', 'digital', 'A coordinar', '0', 'b1b2c3d4-0009-0009-0009-000000000009', 'a1b2c3d4-0009-0009-0009-000000000009'),
('c1000001-0010-0010-0010-000000000010', 'Te ayudo a lanzar tu negocio en 30 dias o te devuelvo el dinero', 'Coach de emprendimiento con 8 anos de experiencia. Plan de accion personalizado y seguimiento semanal.', 85, 'PEN', 'ACTIVA', 378, 'emprendimiento,coaching,negocios', 'other', 'digital', 'A coordinar', '0', 'b1b2c3d4-0010-0010-0010-000000000010', 'a1b2c3d4-0010-0010-0010-000000000010'),
('c1000001-0011-0011-0011-000000000011', 'Animo tu evento de empresa disfrazado de tu CEO', 'Me aprendo sus frases, sus gestos y sus chistes malos. Garantizo fotos para el grupo de WhatsApp.', 200, 'PEN', 'ACTIVA', 612, 'eventos,humor,empresa', 'other', 'digital', 'A coordinar', '0', 'b1b2c3d4-0011-0011-0011-000000000011', 'a1b2c3d4-0011-0011-0011-000000000011'),
('c1000001-0012-0012-0012-000000000012', 'Automatizo tus reportes de Excel para que no los hagas nunca mas', 'Macros, Power Query y dashboards automaticos. Lo que te toma 2 horas cada semana, en 5 minutos con un boton.', 55, 'PEN', 'ACTIVA', 445, 'excel,automatizacion,productividad', 'other', 'digital', 'A coordinar', '0', 'b1b2c3d4-0012-0012-0012-000000000012', 'a1b2c3d4-0012-0012-0012-000000000012'),
('c1000001-0013-0013-0013-000000000013', 'Escribo el guion de tu proximo video de TikTok', 'Hook, desarrollo y CTA incluidos. Tu solo grabas. Entrego en 24h con 3 variantes.', 45, 'PEN', 'ACTIVA', 267, 'tiktok,contenido,guion', 'other', 'digital', 'A coordinar', '0', 'b1b2c3d4-0007-0007-0007-000000000007', 'a1b2c3d4-0007-0007-0007-000000000007'),
('c1000001-0014-0014-0014-000000000014', 'Soy tu hype man en tu proxima presentacion de negocios', 'Te acompano a tu pitch y genero el ambiente para que llegues en modo ganador.', 110, 'PEN', 'ACTIVA', 334, 'eventos,negocios,presentaciones', 'other', 'digital', 'A coordinar', '0', 'b1b2c3d4-0011-0011-0011-000000000011', 'a1b2c3d4-0011-0011-0011-000000000011'),
('c1000001-0015-0015-0015-000000000015', 'Grabo un video felicitando a quien tu quieras', 'Personalizado, gracioso o emotivo segun lo pidas. Ideal para cumpleanos o sorprender a alguien.', 40, 'PEN', 'ACTIVA', 189, 'video,personalizado,regalo', 'other', 'digital', 'A coordinar', '0', 'b1b2c3d4-0001-0001-0001-000000000001', 'a1b2c3d4-0001-0001-0001-000000000001'),
('c1000001-0016-0016-0016-000000000016', 'Creo tu logo en 48 horas por S/80', 'Logo profesional, vectorial y con todas las variantes. Sin revisiones infinitas. Entrega en Figma y PNG.', 80, 'PEN', 'ACTIVA', 523, 'diseno,logo,branding', 'other', 'digital', 'A coordinar', '0', 'b1b2c3d4-0002-0002-0002-000000000002', 'a1b2c3d4-0002-0002-0002-000000000002'),
('c1000001-0017-0017-0017-000000000017', 'Edito tu podcast y lo dejo con sonido profesional', 'Elimino silencios, muletillas y ruido. Agrego musica de fondo e intro. Entrego en 48h.', 85, 'PEN', 'ACTIVA', 145, 'podcast,audio,edicion', 'other', 'digital', 'A coordinar', '0', 'b1b2c3d4-0009-0009-0009-000000000009', 'a1b2c3d4-0009-0009-0009-000000000009'),
('c1000001-0018-0018-0018-000000000018', 'Traduzco tu CV al ingles con terminos de tu sector', 'No es Google Translate. Entiendo tu industria y hago que tu CV suene natural para empresas extranjeras.', 55, 'PEN', 'ACTIVA', 234, 'ingles,traduccion,cv', 'other', 'digital', 'A coordinar', '0', 'b1b2c3d4-0003-0003-0003-000000000003', 'a1b2c3d4-0003-0003-0003-000000000003');

COMMIT;
