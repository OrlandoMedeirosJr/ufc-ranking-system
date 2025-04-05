/*
  Warnings:

  - You are about to drop the column `arrecadacao` on the `Evento` table. All the data in the column will be lost.
  - You are about to drop the column `cidadeEstado` on the `Evento` table. All the data in the column will be lost.
  - You are about to drop the column `payPerView` on the `Evento` table. All the data in the column will be lost.
  - You are about to drop the column `publicoTotal` on the `Evento` table. All the data in the column will be lost.
  - You are about to drop the `Recorde` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `pais` to the `Evento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Evento` table without a default value. This is not possible if the table is not empty.
  - Made the column `local` on table `Evento` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `Luta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `altura` to the `Lutador` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Lutador` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Ranking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Recorde" DROP CONSTRAINT "Recorde_lutadorId_fkey";

-- AlterTable
ALTER TABLE "Evento" DROP COLUMN "arrecadacao",
DROP COLUMN "cidadeEstado",
DROP COLUMN "payPerView",
DROP COLUMN "publicoTotal",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "pais" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "local" SET NOT NULL;

-- AlterTable
ALTER TABLE "Luta" ADD COLUMN     "tempo" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Lutador" ADD COLUMN     "altura" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "apelido" TEXT,
ADD COLUMN     "categoriaAtual" TEXT NOT NULL DEFAULT 'Peso Médio',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "sexo" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Ranking" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "corFundo" DROP NOT NULL;

-- DropTable
DROP TABLE "Recorde";
