-- CreateTable
CREATE TABLE "Recorde" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" INTEGER NOT NULL,
    "lutadorId" INTEGER NOT NULL,
    "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recorde_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Recorde_tipo_key" ON "Recorde"("tipo");

-- AddForeignKey
ALTER TABLE "Recorde" ADD CONSTRAINT "Recorde_lutadorId_fkey" FOREIGN KEY ("lutadorId") REFERENCES "Lutador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
