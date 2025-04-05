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
  HttpStatus
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventoService } from './evento.service';
import { Prisma, Luta } from '@prisma/client';

@Controller('eventos')
export class EventoController {
  private readonly logger = new Logger(EventoController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventoService: EventoService,
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
      const evento = await this.prisma.evento.findUnique({
        where: { id: Number(id) },
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
        return { error: 'Evento não encontrado', statusCode: 404 };
      }
      
      // Mapear as lutas para o formato esperado pelo frontend
      const eventoFormatado = {
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
      };
      
      this.logger.log(`Evento formatado para frontend: ${JSON.stringify(eventoFormatado.id)}`);
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
          // Verificar se os lutadores existem
          const lutador1 = await this.prisma.lutador.findFirst({ where: { nome: luta.lutador1 } });
          const lutador2 = await this.prisma.lutador.findFirst({ where: { nome: luta.lutador2 } });

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
                bonus: luta.bonus || null,
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

      if (eventoCompleto) {
        this.logger.log(`Evento salvo com sucesso com ${eventoCompleto.lutas.length} lutas`);
        return { 
          mensagem: 'Evento e lutas criados com sucesso', 
          evento: eventoCompleto,
          lutas: lutasCriadas.length
        };
      } else {
        this.logger.error('Evento criado mas não foi possível recuperá-lo com as lutas');
        return { 
          mensagem: 'Evento criado com sucesso, mas houve um problema ao recuperar os detalhes completos',
          evento: evento,
          lutas: lutasCriadas.length
        };
      }
    } catch (error) {
      this.logger.error(`Erro ao criar evento: ${error.message}`);
      
      // Tratamento específico para erros do Prisma
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Erro conhecido do Prisma
        switch (error.code) {
          case 'P2002': // Violação de unique constraint
            return { 
              error: 'Erro de duplicidade', 
              statusCode: 400, 
              detalhes: `Já existe um registro com estes dados: ${error.meta?.target}` 
            };
          case 'P2003': // Foreign key constraint failed
            return { 
              error: 'Referência inválida', 
              statusCode: 400, 
              detalhes: `Referência a registro inexistente: ${error.meta?.field_name}` 
            };
          case 'P2025': // Record not found
            return { 
              error: 'Registro não encontrado', 
              statusCode: 404, 
              detalhes: error.meta?.cause || error.message 
            };
          default:
            return { 
              error: 'Erro do banco de dados', 
              statusCode: 400, 
              detalhes: error.message, 
              code: error.code 
            };
        }
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        // Erro de validação do Prisma (formato/tipos incorretos)
        return { 
          error: 'Erro de validação', 
          statusCode: 400, 
          detalhes: error.message.split('\n').slice(-3).join(' ') // Extrair a parte útil da mensagem
        };
      } else if (error instanceof Prisma.PrismaClientRustPanicError) {
        // Falha crítica no Prisma Engine
        this.logger.error('Erro crítico no Prisma Engine', error.stack);
        return { 
          error: 'Erro crítico no servidor', 
          statusCode: 500, 
          detalhes: 'Falha interna no processamento do banco de dados' 
        };
      } else if (error instanceof Prisma.PrismaClientInitializationError) {
        // Erro de inicialização do Prisma
        this.logger.error('Falha na conexão com o banco de dados', error.stack);
        return { 
          error: 'Erro de conexão com o banco de dados', 
          statusCode: 503, 
          detalhes: 'Não foi possível conectar ao banco de dados' 
        };
      } else {
        // Erros genéricos
        return { 
          error: 'Erro ao criar evento', 
          statusCode: 500, 
          detalhes: error.message 
        };
      }
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
              const lutador1 = await this.prisma.lutador.findFirst({ where: { nome: luta.lutadorA.nome } });
              const lutador2 = await this.prisma.lutador.findFirst({ where: { nome: luta.lutadorB.nome } });
              
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
                  bonus: luta.resultado?.bonusLuta ? 'Luta da Noite' : luta.resultado?.bonusPerformance ? 'Performance da Noite' : null,
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

  @Post(':id/finalizar')
  async finalizarEvento(@Param('id') id: string) {
    return this.eventoService.finalizarEvento(Number(id));
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
      const lutador1 = await this.prisma.lutador.findFirst({ where: { nome: lutaData.lutador1 } });
      const lutador2 = await this.prisma.lutador.findFirst({ where: { nome: lutaData.lutador2 } });
      
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
          bonus: lutaData.bonus || null,
          disputaTitulo: lutaData.titulo || false,
          noContest: noContest
        },
        include: {
          lutador1: true,
          lutador2: true,
          vencedor: true
        }
      });
      
      return { 
        mensagem: 'Luta adicionada com sucesso', 
        luta 
      };
    } catch (error) {
      this.logger.error(`Erro ao adicionar luta: ${error.message}`);
      
      if (error instanceof Prisma.PrismaClientValidationError) {
        return { 
          error: 'Erro de validação', 
          statusCode: 400, 
          detalhes: error.message.split('\n').slice(-3).join(' ')
        };
      }
      
      return { 
        error: 'Erro ao adicionar luta', 
        statusCode: 500, 
        detalhes: error.message 
      };
    }
  }
}
