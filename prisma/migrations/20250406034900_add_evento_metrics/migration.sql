-- This is an empty migration.

-- Adicionar campos de público, arrecadação e pay-per-view aos eventos
ALTER TABLE "Evento" ADD COLUMN "publicoTotal" INTEGER;
ALTER TABLE "Evento" ADD COLUMN "arrecadacao" DOUBLE PRECISION;
ALTER TABLE "Evento" ADD COLUMN "payPerView" INTEGER;