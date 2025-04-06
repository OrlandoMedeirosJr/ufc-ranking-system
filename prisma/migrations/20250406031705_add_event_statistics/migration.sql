/*
  Warnings:

  - A unique constraint covering the columns `[nome]` on the table `Lutador` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Evento" ADD COLUMN     "arrecadacao" DOUBLE PRECISION,
ADD COLUMN     "payPerView" INTEGER,
ADD COLUMN     "publicoTotal" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Lutador_nome_key" ON "Lutador"("nome");
