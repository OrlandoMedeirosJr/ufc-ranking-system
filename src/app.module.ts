import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RankingModule } from './ranking/ranking.module';
import { EventoModule } from './evento/evento.module';
import { LutaModule } from './luta/luta.module';
import { RecordeModule } from './recorde/recorde.module';
import { LutadorModule } from './lutador/lutador.module';

@Module({
  imports: [
    RankingModule,
    EventoModule,
    LutaModule,
    RecordeModule,
    LutadorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
