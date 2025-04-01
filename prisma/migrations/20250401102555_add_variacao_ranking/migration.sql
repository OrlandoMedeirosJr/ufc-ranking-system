/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Ranking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ranking" DROP COLUMN "createdAt",
ALTER COLUMN "variacao" SET DEFAULT 0;
