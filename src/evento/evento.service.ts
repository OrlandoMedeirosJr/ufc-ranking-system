import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RankingService } from '../ranking/ranking.service';
import { RecordeService } from '../recorde/recorde.service';
import { Evento } from '@prisma/client';

// Interface estendida para garantir o reconhecimento da propriedade finalizado
interface EventoCompleto extends Evento {
  finalizado: boolean;
}

@Injectable()
export class EventoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rankingService: RankingService,
    private readonly recordeService: RecordeService,
  ) {}

  async finalizarEvento(eventoId: number) {
    const evento = await this.prisma.evento.findUnique({
      where: { id: eventoId },
    }) as EventoCompleto;

    if (!evento) throw new NotFoundException('Evento não encontrado');
    if (evento.finalizado) return { mensagem: 'Evento já foi finalizado' };

    await this.prisma.evento.update({
      where: { id: eventoId },
      data: { finalizado: true } as any,
    });

    await this.rankingService.atualizarTodosOsRankings();
    const recordesNovos = await this.recordeService.verificarNovosRecordes();

    return {
      mensagem: 'Evento finalizado e ranking atualizado com sucesso',
      novosRecordes: recordesNovos,
    };
  }
}
