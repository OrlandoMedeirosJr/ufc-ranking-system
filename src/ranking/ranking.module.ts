import { Module } from '@nestjs/common';
import { RankingController } from './ranking.controller';
import { RankingService } from './ranking.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PontuacaoService } from './pontuacao.service';
import { DesempateService } from './desempate.service';

/**
 * Módulo de Ranking
 * 
 * Responsável por gerenciar o cálculo de pontuações, rankings e manter o sistema
 * de classificação de lutadores. Este módulo se subdivide em três serviços especializados:
 * 
 * - RankingService: Agregação e persistência de dados de ranking
 * - PontuacaoService: Cálculo de pontuação pura para cada luta
 * - DesempateService: Critérios de desempate entre lutadores
 */
@Module({
  imports: [PrismaModule],
  controllers: [RankingController],
  providers: [
    RankingService, 
    PontuacaoService, 
    DesempateService
  ],
  exports: [RankingService]
})
export class RankingModule {}
