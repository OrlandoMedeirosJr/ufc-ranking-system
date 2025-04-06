import { Controller, Get, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(private readonly prisma: PrismaService) {}

  @Get('estatisticas')
  async obterEstatisticas() {
    try {
      this.logger.log('Obtendo estatísticas para o dashboard');
      
      // Buscar contagem de lutadores
      const totalLutadores = await this.prisma.lutador.count();
      
      // Buscar contagem de eventos
      const totalEventos = await this.prisma.evento.count();
      
      // Buscar contagem de lutas
      const totalLutas = await this.prisma.luta.count();
      
      // Buscar categorias ativas
      const categoriasUnicas = await this.prisma.ranking.groupBy({
        by: ['categoria'],
      });
      const totalCategorias = categoriasUnicas.length;
      
      // Retornar todos os dados juntos
      return {
        totalLutadores,
        totalEventos,
        totalLutas,
        totalCategorias
      };
    } catch (error) {
      this.logger.error(`Erro ao obter estatísticas do dashboard: ${error.message}`);
      throw new Error(`Erro ao obter estatísticas do dashboard: ${error.message}`);
    }
  }
} 