import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LutadorService {
  private readonly logger = new Logger(LutadorService.name);
  
  constructor(private readonly prisma: PrismaService) {}

  async listarLutadores(filtros: {
    nome?: string;
    pais?: string;
    sexo?: string;
  }) {
    this.logger.log(`Chamando listarLutadores com filtros: ${JSON.stringify(filtros)}`);
    try {
      const lutadores = await this.prisma.lutador.findMany({
        where: {
          nome: filtros.nome
            ? { contains: filtros.nome, mode: 'insensitive' }
            : undefined,
          pais: filtros.pais
            ? { contains: filtros.pais, mode: 'insensitive' }
            : undefined,
          sexo: filtros.sexo || undefined,
        },
        orderBy: { nome: 'asc' },
      });
      
      this.logger.log(`Encontrados ${lutadores.length} lutadores`);
      return lutadores;
    } catch (error) {
      this.logger.error(`Erro ao buscar lutadores: ${error.message}`, error.stack);
      throw error;
    }
  }
}
