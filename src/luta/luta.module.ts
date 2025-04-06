import { Module } from '@nestjs/common';
import { LutaService } from './luta.service';
import { LutaController } from './luta.controller';
import { PrismaService } from '../prisma/prisma.service';
import { RankingModule } from '../ranking/ranking.module';

@Module({
  imports: [RankingModule],
  controllers: [LutaController],
  providers: [LutaService, PrismaService],
})
export class LutaModule {}
