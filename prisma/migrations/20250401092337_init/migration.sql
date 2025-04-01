-- CreateTable
CREATE TABLE "Lutador" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "pais" TEXT NOT NULL,
    "sexo" TEXT NOT NULL DEFAULT 'Masculino',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lutador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "local" TEXT,
    "cidadeEstado" TEXT,
    "data" TIMESTAMP(3) NOT NULL,
    "publicoTotal" INTEGER,
    "arrecadacao" DOUBLE PRECISION,
    "payPerView" INTEGER,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Luta" (
    "id" SERIAL NOT NULL,
    "eventoId" INTEGER NOT NULL,
    "lutador1Id" INTEGER NOT NULL,
    "lutador2Id" INTEGER NOT NULL,
    "vencedorId" INTEGER,
    "metodoVitoria" TEXT,
    "round" INTEGER,
    "disputaTitulo" BOOLEAN NOT NULL DEFAULT false,
    "bonus" TEXT,
    "categoria" TEXT NOT NULL,
    "noContest" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Luta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ranking" (
    "id" SERIAL NOT NULL,
    "lutadorId" INTEGER NOT NULL,
    "categoria" TEXT NOT NULL,
    "posicao" INTEGER NOT NULL,
    "pontos" INTEGER NOT NULL,
    "corFundo" TEXT NOT NULL,
    "variacao" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ranking_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Luta" ADD CONSTRAINT "Luta_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Luta" ADD CONSTRAINT "Luta_lutador1Id_fkey" FOREIGN KEY ("lutador1Id") REFERENCES "Lutador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Luta" ADD CONSTRAINT "Luta_lutador2Id_fkey" FOREIGN KEY ("lutador2Id") REFERENCES "Lutador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Luta" ADD CONSTRAINT "Luta_vencedorId_fkey" FOREIGN KEY ("vencedorId") REFERENCES "Lutador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ranking" ADD CONSTRAINT "Ranking_lutadorId_fkey" FOREIGN KEY ("lutadorId") REFERENCES "Lutador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
