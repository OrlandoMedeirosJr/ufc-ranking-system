import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  Put,
  Param,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RankingService } from '../ranking/ranking.service';
import { ApiOperation } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { EditarLutaDto } from './dto/editar-luta.dto';

@Controller('lutas')
export class LutaController {
  private readonly logger = new Logger(LutaController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rankingService: RankingService
  ) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async criarLuta(@Body() data: any) {
    try {
      // Processar múltiplos bônus
      if (data.bonus && Array.isArray(data.bonus)) {
        data.bonus = data.bonus.join(',');
      }
      
      const luta = await this.prisma.luta.create({ data });
      
      this.logger.log(`Luta criada com sucesso: ID ${luta.id}`);
      return { mensagem: 'Luta criada com sucesso', luta };
    } catch (error) {
      this.logger.error(`Erro ao criar luta: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Editar uma luta existente' })
  async editarLuta(@Param('id') id: string, @Body() lutaDto: EditarLutaDto) {
    try {
      const lutaId = parseInt(id, 10);
      this.logger.log(`Iniciando edição da luta ${lutaId} com dados: ${JSON.stringify(lutaDto)}`);
      
      // Verificar se a luta existe
      const lutaExistente = await this.prisma.luta.findUnique({
        where: { id: lutaId },
        include: {
          lutador1: true,
          lutador2: true,
          vencedor: true
        }
      });
      
      if (!lutaExistente) {
        throw new NotFoundException(`Luta com ID ${lutaId} não encontrada`);
      }
      
      this.logger.log(`Luta encontrada: ${JSON.stringify(lutaExistente)}`);
      
      // Obter o evento da luta para validações
      const evento = await this.prisma.evento.findUnique({
        where: { id: lutaExistente.eventoId },
      });
      
      if (!evento) {
        throw new NotFoundException(`Evento da luta não encontrado`);
      }
      
      // Preparar dados para atualização
      const updateData: any = {
        categoria: lutaDto.categoria,
        disputaTitulo: lutaDto.disputaTitulo ?? lutaExistente.disputaTitulo,
        metodoVitoria: lutaDto.metodo ?? lutaExistente.metodoVitoria,
        round: lutaDto.round ?? lutaExistente.round,
        tempo: lutaDto.tempo ?? lutaExistente.tempo
      };
      
      // Lógica para lidar com o vencedor/empate/no-contest apenas se o vencedor for alterado
      if (lutaDto.vencedor !== undefined) {
        // Reset todos os status (apenas noContest existe no schema)
        updateData.noContest = false;
        
        if (lutaDto.vencedor === 'empate') {
          // Não existe campo empate no schema, apenas definir vencedorId como null
          updateData.vencedorId = null;
        } else if (lutaDto.vencedor === 'nocontest') {
          updateData.noContest = true;
          updateData.vencedorId = null;
        } else if (lutaDto.vencedor === 'lutadorA') {
          updateData.vencedorId = lutaExistente.lutador1Id;
        } else if (lutaDto.vencedor === 'lutadorB') {
          updateData.vencedorId = lutaExistente.lutador2Id;
        }
      }
      
      // Atualizar os bônus
      this.logger.log(`Bônus recebidos: bonusLuta=${lutaDto.bonusLuta}, bonusPerformance=${lutaDto.bonusPerformance}`);
      this.logger.log(`Bônus existentes: ${lutaExistente.bonus}`);
      
      // Sempre processar os bônus
      let bonuses: string[] = [];
      
      // Verificar os bônus existentes
      const bonusesExistentes = lutaExistente.bonus ? 
        (typeof lutaExistente.bonus === 'string' ? 
          lutaExistente.bonus.split(',').map(b => b.trim()) : 
          Array.isArray(lutaExistente.bonus) ? lutaExistente.bonus : [String(lutaExistente.bonus)]) : 
        [];
      
      this.logger.log(`Bônus existentes processados: ${JSON.stringify(bonusesExistentes)}`);
      
      // Processar bônus apenas se explicitamente fornecidos no DTO
      // Importante: false é um valor válido (remover bônus), undefined significa "não alterar"
      if (lutaDto.bonusLuta === true) {
        bonuses.push('Luta da Noite');
      } else if (lutaDto.bonusLuta === undefined && bonusesExistentes.includes('Luta da Noite')) {
        // Manter o bônus existente se não foi especificado
        bonuses.push('Luta da Noite');
      }
      
      if (lutaDto.bonusPerformance === true) {
        bonuses.push('Performance da Noite');
      } else if (lutaDto.bonusPerformance === undefined && bonusesExistentes.includes('Performance da Noite')) {
        // Manter o bônus existente se não foi especificado
        bonuses.push('Performance da Noite');
      }
      
      // Atualizar o campo de bônus
      updateData.bonus = bonuses.length > 0 ? bonuses.join(',') : null;
      
      this.logger.log(`Campo bonus final: ${updateData.bonus}`);
      this.logger.log(`Dados para atualização: ${JSON.stringify(updateData)}`);
      
      try {
        // Remover campos que não existem no schema do Prisma
        const { empate, ...updateDataSemEmpate } = updateData;
        
        // Atualizar a luta
        const lutaAtualizada = await this.prisma.luta.update({
          where: { id: lutaId },
          data: updateDataSemEmpate,
          include: {
            lutador1: true,
            lutador2: true,
            vencedor: true
          }
        });
        
        this.logger.log(`Luta atualizada com sucesso: ${JSON.stringify(lutaAtualizada)}`);
        
        // Atualizar todos os rankings
        if (evento.finalizado) {
          await this.rankingService.atualizarTodosOsRankings();
        }
        
        return {
          message: 'Luta atualizada com sucesso',
          luta: lutaAtualizada
        };
      } catch (prismaError) {
        this.logger.error(`Erro específico do Prisma ao atualizar: ${prismaError.message}`);
        if (prismaError instanceof Prisma.PrismaClientKnownRequestError) {
          this.logger.error(`Código do erro Prisma: ${prismaError.code}`);
          this.logger.error(`Metadados do erro Prisma: ${JSON.stringify(prismaError.meta)}`);
        }
        throw prismaError;
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        this.logger.error(`Erro do Prisma ao editar luta: ${error.message}`);
        throw new BadRequestException(`Erro ao editar luta: ${error.message}`);
      }
      this.logger.error(`Erro ao editar luta: ${error.message}`);
      if (error instanceof Error && error.stack) {
        this.logger.error(`Stack trace: ${error.stack}`);
      }
      throw error;
    }
  }
}
