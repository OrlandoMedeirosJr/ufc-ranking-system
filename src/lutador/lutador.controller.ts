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

    const stats = await this.rankingService.calcularPontuacaoLutador(lutadorId);

    const totalLutas = await this.prisma.luta.count({
      where: {
        OR: [{ lutador1Id: lutadorId }, { lutador2Id: lutadorId }],
        noContest: false,
      },
    });

    const vitorias = await this.prisma.luta.count({
      where: { vencedorId: lutadorId },
    });

    return {
      nome: lutador.nome,
      pais: lutador.pais,
      sexo: lutador.sexo,
      totalLutas,
      vitorias,
      derrotas: stats.derrotas,
      nocautes:
        stats.vitoriasPrimeiroRound +
        stats.vitoriasSegundoRound +
        stats.vitoriasTerceiroRound,
      finalizacoes:
        stats.vitoriasPrimeiroRound +
        stats.vitoriasSegundoRound +
        stats.vitoriasTerceiroRound, // ajuste se quiser separar nocautes de finalizações
      decisoes:
        vitorias -
        (stats.vitoriasPrimeiroRound +
          stats.vitoriasSegundoRound +
          stats.vitoriasTerceiroRound),
      bonus: stats.bonusTotal,
      vitoriasTitulo: stats.vitoriasTitulo,
    };
  }
}
