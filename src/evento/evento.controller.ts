import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
  Logger,
  HttpException,
  HttpStatus,
  NotFoundException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventoService } from './evento.service';
import { Prisma, Luta } from '@prisma/client';
import { RankingService } from '../ranking/ranking.service';

@Controller('eventos')
export class EventoController {
  private readonly logger = new Logger(EventoController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventoService: EventoService,
    private readonly rankingService: RankingService,
  ) {}

  @Get()
  async listarEventos() {
    try {
      const eventos = await this.prisma.evento.findMany({
        orderBy: { data: 'desc' },
        include: {
          lutas: {
            include: {
              lutador1: true,
              lutador2: true,
              vencedor: true
            },
          },
        },
      });

      // Mapear os eventos e suas lutas para o formato esperado pelo frontend
      const eventosFormatados = eventos.map(evento => ({
        ...evento,
        lutas: evento.lutas.map((luta) => ({
          id: luta.id,
          eventoId: luta.eventoId,
          lutadorA: luta.lutador1,
          lutadorB: luta.lutador2,
          categoria: luta.categoria,
          resultado: luta.vencedorId ? {
            id: luta.id,
            vencedor: luta.vencedorId === luta.lutador1Id ? 'lutadorA' : 
                      luta.vencedorId === luta.lutador2Id ? 'lutadorB' : 
                      luta.noContest ? 'nocontest' : 'empate',
            metodo: luta.metodoVitoria,
            round: luta.round,
            tempo: luta.tempo,
            titulo: luta.disputaTitulo,
            bonusLuta: luta.bonus === 'Luta da Noite',
            bonusPerformance: luta.bonus === 'Performance da Noite'
          } : undefined
        }))
      }));

      return eventosFormatados;
    } catch (error) {
      this.logger.error(`Erro ao listar eventos: ${error.message}`);
      return { 
        error: 'Erro ao listar eventos', 
        statusCode: 500, 
        detalhes: error.message 
      };
    }
  }

  @Get(':id')
  async obterEvento(@Param('id') id: string) {
    try {
      const eventoId = parseInt(id);
      this.logger.log(`Buscando evento com ID: ${eventoId}`);
      
      const evento = await this.prisma.evento.findUnique({
        where: { id: eventoId },
        include: {
          lutas: {
            include: {
              lutador1: true,
              lutador2: true,
              vencedor: true
            },
          },
        },
      });
      
      if (!evento) {
        this.logger.warn(`Evento ID ${eventoId} não encontrado`);
        throw new NotFoundException(`Evento com ID ${eventoId} não encontrado`);
      }
      
      // Formatar para o frontend
      const eventoFormatado = {
        ...evento,
        lutas: evento.lutas.map((luta: any) => {
          // Processar os bônus
          let bonusLuta = false;
          let bonusPerformance = false;
          
          if (luta.bonus) {
            // Verificar se há múltiplos bônus separados por vírgula
            const bonusArray = luta.bonus.split(',');
            bonusLuta = bonusArray.includes('Luta da Noite');
            bonusPerformance = bonusArray.includes('Performance da Noite');
          }
          
          // Verificar se a luta tem resultado (vencedor, empate ou no contest)
          const temResultado = luta.vencedorId !== null || luta.empate || luta.noContest;
          
          return {
            id: luta.id,
            eventoId: luta.eventoId,
            lutadorA: luta.lutador1,
            lutadorB: luta.lutador2,
            categoria: luta.categoria,
            disputaTitulo: luta.disputaTitulo,
            resultado: temResultado ? {
              id: luta.id,
              vencedor: luta.vencedorId === luta.lutador1Id ? 'lutadorA' : 
                        luta.vencedorId === luta.lutador2Id ? 'lutadorB' : 
                        luta.noContest ? 'nocontest' : 'empate',
              metodo: luta.metodoVitoria,
              round: luta.round,
              tempo: luta.tempo,
              titulo: luta.disputaTitulo,
              bonusLuta,
              bonusPerformance
            } : undefined
          };
        })
      };
      
      this.logger.log(`Evento formatado para frontend: ${eventoFormatado.id}`);
      return eventoFormatado;
    } catch (error) {
      this.logger.error(`Erro ao obter evento: ${error.message}`);
      return { 
        error: 'Erro ao obter evento', 
        statusCode: 500, 
        detalhes: error.message 
      };
    }
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async criarEvento(@Body() data: any) {
    try {
      this.logger.log(`Iniciando criação de evento: ${JSON.stringify(data.nome)}`);
      
      // Extrair dados do evento e lutas
      const { lutas, ...eventoData } = data;
      
      // Criar o evento primeiro
      const evento = await this.prisma.evento.create({ 
        data: eventoData 
      });
      
      this.logger.log(`Evento criado com ID: ${evento.id}`);

      // Verificar se existem lutas para criar
      const lutasCriadas: Luta[] = [];
      
      if (lutas && Array.isArray(lutas) && lutas.length > 0) {
        this.logger.log(`Processando ${lutas.length} lutas`);
        
        for (const luta of lutas) {
          // Verificar se os lutadores existem usando findFirst
          const lutador1 = await this.prisma.lutador.findFirst({ 
            where: { nome: luta.lutador1 } 
          });
          
          const lutador2 = await this.prisma.lutador.findFirst({ 
            where: { nome: luta.lutador2 } 
          });

          this.logger.log(`Lutador1: ${lutador1?.nome} (ID: ${lutador1?.id}), Lutador2: ${lutador2?.nome} (ID: ${lutador2?.id})`);

          if (!lutador1 || !lutador2) {
            this.logger.error(`Lutador não encontrado: ${!lutador1 ? luta.lutador1 : luta.lutador2}`);
            // Excluir o evento se um lutador não for encontrado
            await this.prisma.evento.delete({ where: { id: evento.id } });
            return { error: 'Lutador não encontrado', statusCode: 404, lutador: !lutador1 ? luta.lutador1 : luta.lutador2 };
          }

          // Determinar o vencedor com base no resultado (V1, V2, Empate, NC)
          let vencedorId: number | null = null;
          let metodoVitoria = luta.tipo || null;
          let noContest = false;
          
          if (luta.resultado === 'V1') {
            vencedorId = lutador1.id;
          } else if (luta.resultado === 'V2') {
            vencedorId = lutador2.id;
          } else if (luta.resultado === 'NC') {
            noContest = true;
          }

          // Processar os bônus corretamente
          let bonusString: string | null = null;
          if (luta.bonus) {
            if (Array.isArray(luta.bonus)) {
              // Se for um array, junte com vírgula
              bonusString = luta.bonus.length > 0 ? luta.bonus.join(',') : null;
            } else if (typeof luta.bonus === 'string') {
              // Se já for string, use diretamente
              bonusString = luta.bonus;
            }
          }

          // Usar abordagem mais direta para criar luta
          try {
            // Criar a luta com abordagem simplificada usando dados brutos
            const lutaCriada = await this.prisma.luta.create({
              data: {
                eventoId: evento.id,
                lutador1Id: lutador1.id,
                lutador2Id: lutador2.id,
                categoria: luta.categoria || 'Sem categoria',
                round: parseInt(luta.round) || null,
                tempo: luta.tempo || null,
                metodoVitoria: metodoVitoria,
                vencedorId: vencedorId,
                bonus: bonusString,
                disputaTitulo: luta.titulo || false,
                noContest: noContest
              },
            });
            
            this.logger.log(`Luta criada com ID: ${lutaCriada.id}`);
            lutasCriadas.push(lutaCriada);
          } catch (error) {
            // Lidar com erro específico da luta
            this.logger.error(`Erro ao criar luta: ${error.message}`);
            // Excluir o evento se houver erro ao criar uma luta
            await this.prisma.evento.delete({ where: { id: evento.id } });
            throw error; // Propagar erro para o try-catch externo
          }
        }
      }

      // Buscar o evento completo após todas as lutas terem sido criadas
      const eventoCompleto = await this.prisma.evento.findUnique({
        where: { id: evento.id },
        include: {
          lutas: {
            include: {
              lutador1: true,
              lutador2: true,
              vencedor: true
            },
          },
        },
      });
      
      return { 
        mensagem: 'Evento criado com sucesso', 
        evento: eventoCompleto 
      };
    } catch (error) {
      this.logger.error(`Erro ao criar evento: ${error.message}`);
      return { 
        error: 'Erro ao criar evento', 
        statusCode: 500, 
        detalhes: error.message 
      };
    }
  }

  @Post('lutadores')
  async criarLutador(@Body() data: any) {
    const lutador = await this.prisma.lutador.create({ data });
    return { mensagem: 'Lutador criado com sucesso', lutador };
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async atualizarEvento(@Param('id') id: string, @Body() data: any) {
    try {
      this.logger.log(`Iniciando atualização do evento ${id}: ${JSON.stringify(data.nome)}`);
      
      // Extrair dados do evento e lutas
      const { lutas, ...eventoData } = data;
      
      // Verificar se o evento está sendo finalizado
      const eventoExistente = await this.prisma.evento.findUnique({
        where: { id: Number(id) }
      });
      
      if (!eventoExistente) {
        throw new HttpException(
          { error: 'Evento não encontrado' },
          HttpStatus.NOT_FOUND
        );
      }
      
      const finalizandoEvento = eventoExistente && !eventoExistente.finalizado && eventoData.finalizado === true;
      
      // Atualizar os dados básicos do evento
      const evento = await this.prisma.evento.update({
        where: { id: Number(id) },
        data: eventoData,
      });
      
      this.logger.log(`Dados básicos do evento ${id} atualizados com sucesso`);
      
      // Verificar se existem lutas para processar
      if (lutas && Array.isArray(lutas) && lutas.length > 0) {
        this.logger.log(`Processando ${lutas.length} lutas para o evento ${id}`);
        
        // Identificar lutas novas a serem criadas (as que não têm ID)
        const lutasNovas = lutas.filter(luta => !luta.id);
        
        // Processar lutas novas
        if (lutasNovas.length > 0) {
          this.logger.log(`Criando ${lutasNovas.length} novas lutas para o evento ${id}`);
          
          for (const luta of lutasNovas) {
            try {
              // Verificar se os lutadores existem
              const lutador1 = await this.prisma.lutador.findFirst({ 
                where: { nome: luta.lutadorA.nome } 
              });
              
              const lutador2 = await this.prisma.lutador.findFirst({ 
                where: { nome: luta.lutadorB.nome } 
              });
              
              if (!lutador1 || !lutador2) {
                this.logger.error(`Lutador não encontrado: ${!lutador1 ? luta.lutadorA.nome : luta.lutadorB.nome}`);
                throw new HttpException(
                  { error: 'Lutador não encontrado', lutador: !lutador1 ? luta.lutadorA.nome : luta.lutadorB.nome },
                  HttpStatus.NOT_FOUND
                );
              }
              
              // Determinar o vencedor com base no resultado
              let vencedorId: number | null = null;
              let metodoVitoria = null;
              let noContest = false;
              
              if (luta.resultado) {
                if (luta.resultado.vencedor === 'lutadorA') {
                  vencedorId = lutador1.id;
                } else if (luta.resultado.vencedor === 'lutadorB') {
                  vencedorId = lutador2.id;
                } else if (luta.resultado.vencedor === 'nocontest') {
                  noContest = true;
                }
                
                metodoVitoria = luta.resultado.metodo || null;
              }

              // Processar bônus para garantir que seja uma string ou null
              let bonusString: string | null = null;
              if (luta.resultado?.bonusLuta && luta.resultado?.bonusPerformance) {
                bonusString = 'Luta da Noite,Performance da Noite';
              } else if (luta.resultado?.bonusLuta) {
                bonusString = 'Luta da Noite';
              } else if (luta.resultado?.bonusPerformance) {
                bonusString = 'Performance da Noite';
              }
              
              // Criar a luta com os dados recebidos
              await this.prisma.luta.create({
                data: {
                  eventoId: Number(id),
                  lutador1Id: lutador1.id,
                  lutador2Id: lutador2.id,
                  categoria: luta.categoria || 'Sem categoria',
                  round: luta.resultado?.round || null,
                  tempo: null,
                  metodoVitoria: metodoVitoria,
                  vencedorId: vencedorId,
                  bonus: bonusString,
                  disputaTitulo: luta.resultado?.titulo || false,
                  noContest: noContest
                }
              });
              
              this.logger.log(`Nova luta criada com sucesso para o evento ${id}`);
            } catch (error) {
              this.logger.error(`Erro ao criar nova luta para o evento ${id}: ${error.message}`);
              throw error;
            }
          }
        }
      }
      
      // Se o evento estava sendo finalizado, atualizar os rankings
      if (finalizandoEvento) {
        this.logger.log(`Evento ${id} sendo finalizado, atualizando rankings...`);
        await this.rankingService.atualizarTodosOsRankings();
      } else {
        this.logger.log(`Evento ${id} foi editado, atualizando rankings...`);
        await this.rankingService.atualizarTodosOsRankings();
      }
      
      // Buscar o evento completo após as atualizações
      const eventoAtualizado = await this.prisma.evento.findUnique({
        where: { id: Number(id) },
        include: {
          lutas: {
            include: {
              lutador1: true,
              lutador2: true,
              vencedor: true
            }
          }
        }
      });
      
      this.logger.log(`Evento ${id} atualizado com sucesso`);
      return { 
        mensagem: 'Evento atualizado com sucesso', 
        evento: eventoAtualizado 
      };
    } catch (error) {
      this.logger.error(`Erro ao atualizar evento ${id}: ${error.message}`);
      return { 
        error: 'Erro ao atualizar evento', 
        statusCode: error.status || 500, 
        detalhes: error.response?.error || error.message 
      };
    }
  }

  @Delete(':id')
  async excluirEvento(@Param('id') id: string) {
    try {
      // Verificar se o evento existe
      const evento = await this.prisma.evento.findUnique({
        where: { id: Number(id) },
        include: { lutas: true },
      });
      
      if (!evento) {
        return { error: 'Evento não encontrado', statusCode: 404 };
      }
      
      // Excluir todas as lutas associadas primeiro
      if (evento.lutas.length > 0) {
        await this.prisma.luta.deleteMany({
          where: { eventoId: Number(id) },
        });
      }
      
      // Excluir o evento
      await this.prisma.evento.delete({
        where: { id: Number(id) },
      });
      
      return { mensagem: 'Evento excluído com sucesso' };
    } catch (error) {
      return { error: 'Erro ao excluir evento', statusCode: 400, detalhes: error.message };
    }
  }

  @Put(':id/finalizar')
  async finalizarEvento(@Param('id') id: string) {
    try {
      this.logger.log(`Iniciando finalização do evento ${id} via controller`);
      
      // Registrar os serviços disponíveis para depuração
      this.logger.log(`Serviços injetados: eventoService=${!!this.eventoService}, rankingService=${!!this.rankingService}`);
      
      // Chamar o serviço para finalizar o evento
      this.logger.log(`Chamando eventoService.finalizarEvento para o evento ${id}`);
      const resultado = await this.eventoService.finalizarEvento(Number(id));
      
      this.logger.log(`Evento ${id} finalizado com sucesso`);
      return resultado;
    } catch (error) {
      this.logger.error(`Erro ao finalizar evento ${id}: ${error.message}`);
      return { 
        error: 'Erro ao finalizar evento', 
        statusCode: error.status || 500, 
        detalhes: error.message 
      };
    }
  }

  @Delete('sistema/limpar-banco')
  async limparBancoDados() {
    try {
      console.log('Iniciando limpeza do banco de dados...');

      // 1. Excluir rankings
      await this.prisma.ranking.deleteMany({});
      console.log('Rankings excluídos com sucesso');
      
      // 2. Excluir lutas
      await this.prisma.luta.deleteMany({});
      console.log('Lutas excluídas com sucesso');
      
      // 3. Excluir eventos
      await this.prisma.evento.deleteMany({});
      console.log('Eventos excluídos com sucesso');
      
      // 4. Excluir lutadores
      await this.prisma.lutador.deleteMany({});
      console.log('Lutadores excluídos com sucesso');

      console.log('Limpeza do banco de dados concluída com sucesso.');
      
      return { 
        mensagem: 'Banco de dados limpo com sucesso!',
        detalhes: 'Todos os eventos, lutas, lutadores e rankings foram removidos.'
      };
    } catch (error) {
      console.error('Erro ao limpar banco de dados:', error);
      return { 
        error: 'Erro ao limpar o banco de dados', 
        statusCode: 500, 
        detalhes: error.message 
      };
    }
  }

  // Novo endpoint para adicionar luta a um evento existente
  @Post(':id/lutas')
  async adicionarLuta(@Param('id') id: string, @Body() lutaData: any) {
    try {
      // Verificar se o evento existe
      const evento = await this.prisma.evento.findUnique({
        where: { id: Number(id) }
      });
      
      if (!evento) {
        return { error: 'Evento não encontrado', statusCode: 404 };
      }
      
      // Verificar se os lutadores existem
      const lutador1 = await this.prisma.lutador.findFirst({ 
        where: { nome: lutaData.lutador1 } 
      });
      
      const lutador2 = await this.prisma.lutador.findFirst({ 
        where: { nome: lutaData.lutador2 } 
      });
      
      if (!lutador1 || !lutador2) {
        return { 
          error: 'Lutador não encontrado', 
          statusCode: 404, 
          lutador: !lutador1 ? lutaData.lutador1 : lutaData.lutador2 
        };
      }
      
      // Determinar o vencedor com base no resultado
      let vencedorId: number | null = null;
      let metodoVitoria = lutaData.tipo || null;
      let noContest = false;
      
      if (lutaData.resultado === 'V1') {
        vencedorId = lutador1.id;
      } else if (lutaData.resultado === 'V2') {
        vencedorId = lutador2.id;
      } else if (lutaData.resultado === 'NC') {
        noContest = true;
      }

      // Processar os bônus corretamente como string
      let bonusString: string | null = null;
      if (lutaData.bonus) {
        if (Array.isArray(lutaData.bonus)) {
          // Se for um array, junte com vírgula
          bonusString = lutaData.bonus.length > 0 ? lutaData.bonus.join(',') : null;
        } else if (typeof lutaData.bonus === 'string') {
          // Se já for string, use diretamente
          bonusString = lutaData.bonus;
        }
      }
      
      // Criar a luta
      const luta = await this.prisma.luta.create({
        data: {
          eventoId: Number(id),
          lutador1Id: lutador1.id,
          lutador2Id: lutador2.id,
          categoria: lutaData.categoria || 'Sem categoria',
          round: parseInt(lutaData.round) || null,
          tempo: lutaData.tempo || null,
          metodoVitoria: metodoVitoria,
          vencedorId: vencedorId,
          bonus: bonusString,
          disputaTitulo: lutaData.titulo || false,
          noContest: noContest
        },
        include: {
          lutador1: true,
          lutador2: true,
          vencedor: true
        }
      });
      
      this.logger.log(`Luta adicionada com sucesso ao evento ${id}`);
      
      // Se o evento estiver finalizado, atualize os rankings
      if (evento.finalizado) {
        this.logger.log(`Evento finalizado, atualizando rankings...`);
        await this.rankingService.atualizarTodosOsRankings();
      }
      
      return { 
        mensagem: 'Luta adicionada com sucesso', 
        luta
      };
    } catch (error) {
      this.logger.error(`Erro ao adicionar luta: ${error.message}`);
      return { 
        error: 'Erro ao adicionar luta', 
        statusCode: 500, 
        detalhes: error.message 
      };
    }
  }
}
