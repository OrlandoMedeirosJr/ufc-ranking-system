import { Module } from '@nestjs/common';
import { EventoController } from './evento.controller';
import { EventoService } from './evento.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RankingModule } from '../ranking/ranking.module';
import { RecordeModule } from '../recorde/recorde.module';

@Module({
  imports: [PrismaModule, RankingModule, RecordeModule],
  controllers: [EventoController],
  providers: [EventoService],
})
export class EventoModule {}
