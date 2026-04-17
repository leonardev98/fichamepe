-- Publicaciones destacadas por referidos (1 referido = 1 destacada activa)
-- Ejecutar después de 0024.

ALTER TABLE "service"
  ADD COLUMN IF NOT EXISTS "isFeatured" boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "IDX_service_is_featured"
  ON "service" ("isFeatured");
