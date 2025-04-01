import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RankingService } from '../ranking/ranking.service';

@Injectable()
export class LutaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rankingService: RankingService,
  ) {}

  async editarLuta(id: number, dados: any) {
    const luta = await this.prisma.luta.findUnique({ where: { id } });
    if (!luta) throw new NotFoundException('Luta não encontrada');

    await this.prisma.luta.update({
      where: { id },
      data: dados,
    });

    await this.rankingService.atualizarTodosOsRankings();

    return { mensagem: 'Luta editada e ranking atualizado' };
  }
}
