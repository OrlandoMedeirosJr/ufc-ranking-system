import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LutadorService {
  constructor(private readonly prisma: PrismaService) {}

  async listarLutadores(filtros: {
    nome?: string;
    pais?: string;
    sexo?: string;
  }) {
    return this.prisma.lutador.findMany({
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
  }
}
