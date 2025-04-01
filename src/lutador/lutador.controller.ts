import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RankingService } from '../ranking/ranking.service';

@Controller('lutadores')
export class LutadorController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rankingService: RankingService,
  ) {}

  @Get(':id/estatisticas')
  async estatisticas(@Param('id') id: string) {
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
