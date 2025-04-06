import { Controller, Get, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

interface DashboardStats {
  totalLutadores: number;
  totalEventos: number;
  totalLutas: number;
  totalCategorias: number;
}

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(private readonly prisma: PrismaService) {}

  @Get('estatisticas')
  @ApiOperation({ summary: 'Obter estatísticas gerais para o dashboard' })
  @ApiResponse({ status: 200, description: 'Estatísticas obtidas com sucesso' })
  async obterEstatisticas(): Promise<DashboardStats> {
    try {
      this.logger.log('Obtendo estatísticas para o dashboard');
      
      // Buscar as estatísticas em paralelo para melhor performance
      const [totalLutadores, totalEventos, totalLutas, categoriasUnicas] = await Promise.all([
        this.prisma.lutador.count(),
        this.prisma.evento.count(),
        this.prisma.luta.count(),
        this.prisma.ranking.groupBy({
          by: ['categoria'],
        })
      ]);
      
      const totalCategorias = categoriasUnicas.length;
      
      this.logger.log(`Estatísticas obtidas: ${totalLutadores} lutadores, ${totalEventos} eventos, ${totalLutas} lutas, ${totalCategorias} categorias`);
      
      // Retornar todos os dados juntos
      return {
        totalLutadores,
        totalEventos,
        totalLutas,
        totalCategorias
      };
    } catch (error) {
      this.logger.error(`Erro ao obter estatísticas do dashboard: ${error.message}`, error.stack);
      throw error;
    }
  }
} 