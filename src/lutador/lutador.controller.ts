import { Controller, Get, Param, NotFoundException, Query, Logger, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RankingService } from '../ranking/ranking.service';
import { LutadorService } from './lutador.service';

@Controller('lutadores')
export class LutadorController {
  private readonly logger = new Logger(LutadorController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rankingService: RankingService,
    private readonly lutadorService: LutadorService,
  ) {}

  @Get()
  async listar(
    @Query('nome') nome?: string,
    @Query('pais') pais?: string,
    @Query('sexo') sexo?: string,
  ) {
    this.logger.log(`Buscando lutadores com filtros: nome=${nome}, pais=${pais}, sexo=${sexo}`);
    try {
      const lutadores = await this.lutadorService.listarLutadores({ nome, pais, sexo });
      this.logger.log(`Encontrados ${lutadores.length} lutadores`);
      return lutadores;
    } catch (error) {
      this.logger.error(`Erro ao listar lutadores: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async criar(@Body() data: any) {
    this.logger.log(`Criando lutador com dados: ${JSON.stringify(data)}`);
    try {
      const lutador = await this.prisma.lutador.create({
        data: {
          nome: data.nome,
          pais: data.pais,
          sexo: data.sexo,
          altura: data.altura || 1.80, // Valor padrão para altura se não fornecido
          apelido: data.apelido || null,
          categoriaAtual: data.categoriaAtual || "Peso Médio"
        },
      });
      this.logger.log(`Lutador criado com ID: ${lutador.id}`);
      return { mensagem: 'Lutador criado com sucesso', lutador };
    } catch (error) {
      this.logger.error(`Erro ao criar lutador: ${error.message}`, error.stack);
      return { error: 'Erro ao criar lutador', statusCode: 400, detalhes: error.message };
    }
  }

  @Get(':id/estatisticas')
  async estatisticas(@Param('id') id: string) {
    this.logger.log(`Buscando estatísticas do lutador com ID ${id}`);
    const lutadorId = parseInt(id);
    const lutador = await this.prisma.lutador.findUnique({
      where: { id: lutadorId },
    });
    if (!lutador) throw new NotFoundException('Lutador não encontrado');

    // Buscar todas as lutas do lutador
    const lutas = await this.prisma.luta.findMany({
      where: {
        OR: [{ lutador1Id: lutadorId }, { lutador2Id: lutadorId }],
        noContest: false,
      },
    });

    let vitorias = 0;
    let derrotas = 0;
    let nocautes = 0;
    let finalizacoes = 0;
    let decisoes = 0;
    let bonus = 0;
    let vitoriasTitulo = 0;

    for (const luta of lutas) {
      const venceu = luta.vencedorId === lutadorId;
      const perdeu = luta.vencedorId && luta.vencedorId !== lutadorId;
      const metodo = luta.metodoVitoria?.toLowerCase() ?? '';

      if (venceu) {
        vitorias++;
        
        if (metodo === 'nocaute') nocautes++;
        else if (metodo === 'finalização') finalizacoes++;
        else if (metodo.includes('decisão')) decisoes++;
        
        if (luta.disputaTitulo) vitoriasTitulo++;
      } else if (perdeu) {
        derrotas++;
      }

      if (luta.bonus) {
        // Tratar múltiplos bônus separados por vírgula
        const bonuses = typeof luta.bonus === 'string' ? 
                        luta.bonus.split(',').map(b => b.trim()) : 
                        [luta.bonus];
        
        for (const bonusItem of bonuses) {
          if (bonusItem === 'Performance da Noite' && venceu) bonus++;
          if (bonusItem === 'Luta da Noite') bonus++;
        }
      }
    }

    return {
      nome: lutador.nome,
      pais: lutador.pais,
      sexo: lutador.sexo,
      totalLutas: lutas.length,
      vitorias,
      derrotas,
      nocautes,
      finalizacoes,
      decisoes,
      bonus,
      vitoriasTitulo,
    };
  }

  @Get(':id/estatisticas/:categoria')
  async estatisticasPorCategoria(
    @Param('id') id: string,
    @Param('categoria') categoria: string
  ) {
    this.logger.log(`Buscando estatísticas do lutador com ID ${id} na categoria ${categoria}`);
    const lutadorId = parseInt(id);
    const lutador = await this.prisma.lutador.findUnique({
      where: { id: lutadorId },
    });
    if (!lutador) throw new NotFoundException('Lutador não encontrado');

    // Buscar apenas lutas da categoria específica
    const lutas = await this.prisma.luta.findMany({
      where: {
        OR: [{ lutador1Id: lutadorId }, { lutador2Id: lutadorId }],
        categoria: categoria,
        noContest: false,
      },
    });

    let vitorias = 0;
    let derrotas = 0;
    let empates = 0;
    let nocautes = 0;
    let finalizacoes = 0;
    let decisoes = 0;
    let bonus = 0;
    let vitoriasTitulo = 0;

    for (const luta of lutas) {
      const venceu = luta.vencedorId === lutadorId;
      const perdeu = luta.vencedorId && luta.vencedorId !== lutadorId;
      const empate = !luta.vencedorId;
      const metodo = luta.metodoVitoria?.toLowerCase() ?? '';

      if (venceu) {
        vitorias++;
        
        if (metodo === 'nocaute') nocautes++;
        else if (metodo === 'finalização') finalizacoes++;
        else if (metodo.includes('decisão')) decisoes++;
        
        if (luta.disputaTitulo) vitoriasTitulo++;
      } else if (perdeu) {
        derrotas++;
      } else if (empate) {
        empates++;
      }

      if (luta.bonus) {
        // Tratar múltiplos bônus separados por vírgula
        const bonuses = typeof luta.bonus === 'string' ? 
                        luta.bonus.split(',').map(b => b.trim()) : 
                        [luta.bonus];
        
        for (const bonusItem of bonuses) {
          if (bonusItem === 'Performance da Noite' && venceu) bonus++;
          if (bonusItem === 'Luta da Noite') bonus++;
        }
      }
    }

    return {
      nome: lutador.nome,
      pais: lutador.pais,
      sexo: lutador.sexo,
      totalLutas: lutas.length,
      vitorias,
      derrotas,
      empates,
      nocautes,
      finalizacoes,
      decisoes,
      bonus,
      vitoriasTitulo,
    };
  }

  @Get(':nome/info-ranking')
  async obterInfoRanking(@Param('nome') nome: string) {
    this.logger.log(`Buscando informações de ranking para o lutador ${nome}`);
    
    // Buscar o lutador pelo nome
    const lutador = await this.prisma.lutador.findFirst({
      where: {
        nome: {
          contains: nome,
          mode: 'insensitive'
        }
      }
    });

    if (!lutador) {
      throw new NotFoundException(`Lutador com nome ${nome} não encontrado`);
    }

    // Buscar posição no ranking peso por peso
    const rankingPesoPorPeso = await this.prisma.ranking.findFirst({
      where: {
        lutadorId: lutador.id,
        categoria: 'Peso por Peso'
      }
    });

    // Buscar posição no ranking da categoria atual do lutador
    const rankingCategoria = await this.prisma.ranking.findFirst({
      where: {
        lutadorId: lutador.id,
        categoria: lutador.categoriaAtual
      }
    });

    // Buscar as últimas lutas do lutador ordenadas por data (mais recentes primeiro)
    const ultimasLutas = await this.prisma.luta.findMany({
      where: {
        OR: [
          { lutador1Id: lutador.id },
          { lutador2Id: lutador.id }
        ],
        noContest: false
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Consideramos até 10 lutas para calcular sequências
    });

    // Calcular a sequência atual (vitórias ou derrotas consecutivas)
    let sequenciaAtual = 0;
    let tipoSequencia = '';

    for (const luta of ultimasLutas) {
      const venceu = luta.vencedorId === lutador.id;
      const perdeu = luta.vencedorId && luta.vencedorId !== lutador.id;
      const empate = !luta.vencedorId;
      
      if (sequenciaAtual === 0) {
        // Primeira luta analisada
        if (venceu) {
          sequenciaAtual = 1;
          tipoSequencia = 'vitória';
        } else if (perdeu) {
          sequenciaAtual = 1;
          tipoSequencia = 'derrota';
        } else {
          // Empate, não conta para sequência
          break;
        }
      } else {
        // Lutas subsequentes
        if ((tipoSequencia === 'vitória' && venceu) || 
            (tipoSequencia === 'derrota' && perdeu)) {
          sequenciaAtual++;
        } else {
          // Sequência quebrada
          break;
        }
      }
    }

    // Formatar a descrição da sequência
    let descricaoSequencia = '';
    if (sequenciaAtual > 0) {
      if (sequenciaAtual === 1) {
        descricaoSequencia = `Vem de ${tipoSequencia}`;
      } else {
        descricaoSequencia = `${sequenciaAtual} ${tipoSequencia}s consecutivas`;
      }
    } else {
      descricaoSequencia = 'Sem lutas recentes';
    }

    return {
      lutador: {
        id: lutador.id,
        nome: lutador.nome,
        categoriaAtual: lutador.categoriaAtual,
      },
      ranking: {
        pesoPorPeso: rankingPesoPorPeso ? rankingPesoPorPeso.posicao : null,
        categoria: rankingCategoria ? {
          nome: lutador.categoriaAtual,
          posicao: rankingCategoria.posicao
        } : null
      },
      sequencia: {
        tipo: tipoSequencia,
        quantidade: sequenciaAtual,
        descricao: descricaoSequencia
      }
    };
  }
}
