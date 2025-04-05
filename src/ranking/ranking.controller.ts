import { Controller, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { RankingService } from './ranking.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('ranking')
export class RankingController {
  // Lista de categorias válidas
  private readonly categoriasValidas = [
    'Peso por Peso', 
    'Peso Mosca', 
    'Peso Galo', 
    'Peso Pena', 
    'Peso Leve', 
    'Peso Meio-Médio', 
    'Peso Médio', 
    'Peso Meio-Pesado', 
    'Peso Pesado', 
    'Peso Palha', 
    'Peso Mosca Feminino', 
    'Peso Galo Feminino', 
    'Peso Pena Feminino'
  ];

  constructor(private readonly rankingService: RankingService, private readonly prisma: PrismaService) {}

  @Get('atualizar')
  async atualizarRankings() {
    await this.rankingService.atualizarTodosOsRankings();
    return { mensagem: 'Ranking atualizado com sucesso' };
  }

  @Get('categorias')
  async listarCategorias() {
    // Consultar categorias que têm lutadores
    const categorias = await this.prisma.lutador.findMany({
      select: {
        categoriaAtual: true,
      },
      distinct: ['categoriaAtual'],
      where: {
        categoriaAtual: {
          not: '',
        },
      },
    });

    // Extrair os nomes das categorias
    const categoriasDisponiveis = categorias.map(c => c.categoriaAtual).filter(Boolean);
    console.log(`Categorias disponíveis no sistema: ${categoriasDisponiveis.join(', ')}`);

    return categoriasDisponiveis;
  }

  @Get(':categoria')
  async obterRanking(@Param('categoria') categoria: string) {
    console.log(`Requisição de ranking recebida para categoria: "${categoria}"`);
    
    try {
      // Verificamos se a categoria é válida
      if (!this.categoriasValidas.includes(categoria) && categoria !== 'todos') {
        console.log(`Categoria inválida: "${categoria}"`);
        throw new HttpException(`Categoria "${categoria}" não encontrada`, HttpStatus.NOT_FOUND);
      }

      // Construir a consulta base
      let lutadores;
      
      if (categoria === 'Peso por Peso') {
        console.log('Buscando ranking pound-for-pound...');
        // Para o ranking pound-for-pound, ordenamos todos os lutadores por pontos
        lutadores = await this.prisma.lutador.findMany({
          orderBy: {
            pontos: 'desc',
          } as any, // Cast para evitar erros de tipo
          take: 15, // Limitamos aos 15 primeiros apenas
        });
      } else if (categoria === 'todos') {
        console.log('Buscando todos os lutadores...');
        // Buscar todos os lutadores, ordenados por pontos
        lutadores = await this.prisma.lutador.findMany({
          orderBy: {
            pontos: 'desc',
          } as any, // Cast para evitar erros de tipo
        });
      } else {
        console.log(`Buscando lutadores da categoria: "${categoria}"`);
        // Filtrar por categoria específica
        lutadores = await this.prisma.lutador.findMany({
          where: {
            categoriaAtual: categoria,
          },
          orderBy: {
            pontos: 'desc',
          } as any, // Cast para evitar erros de tipo
        });
      }
      
      console.log(`Encontrados ${lutadores.length} lutadores para a categoria "${categoria}"`);
      
      return lutadores.map((lutador, index) => ({
        ...lutador,
        posicao: index + 1,
      }));
    } catch (error) {
      console.error('Erro ao obter ranking:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Erro ao processar ranking', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
