import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RankingService } from '../ranking/ranking.service';
import { RecordeService } from '../recorde/recorde.service';
import { Evento } from '@prisma/client';
import { Logger } from '@nestjs/common';

// Interface estendida para garantir o reconhecimento da propriedade finalizado
interface EventoCompleto extends Evento {
  finalizado: boolean;
}

@Injectable()
export class EventoService {
  private readonly logger = new Logger(EventoService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rankingService: RankingService,
    private readonly recordeService: RecordeService,
  ) {}

  async finalizarEvento(id: number) {
    try {
      this.logger.log(`Iniciando processo de finalização do evento ${id}`);
      
      // Verificar se o evento existe
      const evento = await this.prisma.evento.findUnique({
        where: { id },
      });
      
      if (!evento) {
        this.logger.error(`Evento ${id} não encontrado`);
        throw new Error(`Evento com ID ${id} não encontrado`);
      }
      
      // Verificar se o evento já está finalizado
      if (evento.finalizado) {
        this.logger.warn(`Evento ${id} já está finalizado`);
        return { mensagem: 'Evento já está finalizado' };
      }
      
      // Atualizar o status do evento para finalizado
      this.logger.log(`Atualizando status do evento ${id} para finalizado`);
      await this.prisma.evento.update({
        where: { id },
        data: { finalizado: true },
      });
      
      // Atualizar rankings
      this.logger.log(`Chamando serviço de ranking para atualizar rankings após finalização do evento ${id}`);
      await this.rankingService.atualizarTodosOsRankings();
      this.logger.log(`Rankings atualizados com sucesso após finalização do evento ${id}`);
      
      // Verificar novos recordes
      this.logger.log(`Verificando novos recordes após finalização do evento ${id}`);
      const recordesNovos = await this.recordeService.verificarNovosRecordes();
      this.logger.log(`Verificação de recordes concluída após finalização do evento ${id}`);
      
      return {
        mensagem: 'Evento finalizado com sucesso',
        novosRecordes: recordesNovos,
      };
    } catch (error) {
      this.logger.error(`Erro ao finalizar evento ${id}: ${error.message}`);
      throw new Error(`Erro ao finalizar evento: ${error.message}`);
    }
  }
}
