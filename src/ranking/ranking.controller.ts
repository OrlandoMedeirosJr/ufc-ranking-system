import { Controller, Get, Param } from '@nestjs/common';
import { RankingService } from './ranking.service';

@Controller('ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @Get('atualizar')
  async atualizarRankings() {
    await this.rankingService.atualizarTodosOsRankings();
    return { mensagem: 'Ranking atualizado com sucesso' };
  }

  @Get(':categoria')
  async getRankingPorCategoria(@Param('categoria') categoria: string) {
    const ranking = await this.rankingService.getRankingPorCategoria(categoria);
    return ranking;
  }
}
