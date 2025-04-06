import { Controller, Get, Param } from '@nestjs/common';
import { RankingService } from './ranking.service';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

/**
 * Controlador para gerenciamento de rankings
 * 
 * Fornece endpoints para obter e atualizar rankings de lutadores por categoria
 */
@ApiTags('ranking')
@Controller('ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  /**
   * Atualiza os rankings de todas as categorias com base nos dados atuais.
   * Esta operação é computacionalmente intensiva e deve ser usada com moderação.
   */
  @ApiOperation({ summary: 'Atualiza manualmente todos os rankings' })
  @ApiResponse({ status: 200, description: 'Rankings atualizados com sucesso' })
  @Get('atualizar')
  async atualizarRankings() {
    await this.rankingService.atualizarTodosOsRankings();
    return { mensagem: 'Ranking atualizado com sucesso' };
  }

  /**
   * Obtém o ranking de uma categoria específica
   * @param categoria - Nome da categoria a ser consultada
   */
  @ApiOperation({ summary: 'Obtém o ranking de uma categoria específica' })
  @ApiParam({ name: 'categoria', description: 'Nome da categoria (ex: Peso por Peso, Peso Mosca, etc)' })
  @ApiResponse({ status: 200, description: 'Ranking da categoria' })
  @Get(':categoria')
  async getRankingPorCategoria(@Param('categoria') categoria: string) {
    const ranking = await this.rankingService.getRankingPorCategoria(categoria);
    return ranking;
  }
}
