import { Module } from '@nestjs/common';
import { LutadorController } from './lutador.controller';
import { LutadorService } from './lutador.service';
import { PrismaService } from '../prisma/prisma.service';
import { RankingModule } from '../ranking/ranking.module';

@Module({
  imports: [RankingModule],
  controllers: [LutadorController],
  providers: [LutadorService, PrismaService],
})
export class LutadorModule {}
