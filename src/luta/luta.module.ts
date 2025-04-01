import { Module } from '@nestjs/common';
import { LutaService } from './luta.service';
import { LutaController } from './luta.controller';
import { PrismaService } from '../prisma/prisma.service';
import { RankingService } from '../ranking/ranking.service';

@Module({
  controllers: [LutaController],
  providers: [LutaService, PrismaService, RankingService],
})
export class LutaModule {}
