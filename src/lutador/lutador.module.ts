import { Module } from '@nestjs/common';
import { LutadorController } from './lutador.controller';
import { LutadorService } from './lutador.service';
import { PrismaService } from '../prisma/prisma.service';
import { RankingService } from '../ranking/ranking.service';

@Module({
  controllers: [LutadorController],
  providers: [LutadorService, PrismaService, RankingService],
})
export class LutadorModule {}
