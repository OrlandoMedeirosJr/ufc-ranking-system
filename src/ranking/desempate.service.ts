import { Injectable, Logger } from '@nestjs/common';

/**
 * Interface para representar um lutador com suas estatísticas para ranking
 */
interface LutadorRanking {
  lutadorId: number;
  nome: string;
  pontos: number;
  derrotas: number;
  vitoriasTitulo: number;
  vitoriasPrimeiroRound: number;
  vitoriasSegundoRound: number;
  vitoriasTerceiroRound: number;
  bonusTotal: number;
  [key: string]: any; // Para permitir outros campos
}

/**
 * Interface para representar um lutador com estatísticas simplificadas para desempate
 */
interface LutadorDesempate {
  id: number;
  vitorias: number;
  derrotas: number;
  vitoriasTitulo: number;
  vitoriasPrimeiroRound: number;
  vitoriasSegundoRound: number;
  vitoriasTerceiroRound: number;
  bonus: number;
}

@Injectable()
export class DesempateService {
  private readonly logger = new Logger(DesempateService.name);

  /**
   * Ordena uma lista de lutadores aplicando todos os critérios de desempate
   * @param lutadores - Lista de lutadores com seus dados para ranking
   * @returns Lista ordenada de lutadores
   */
  ordenarRankingComDesempate(lutadores: LutadorRanking[]): LutadorRanking[] {
    this.logger.debug(`Ordenando ranking com ${lutadores.length} lutadores aplicando critérios de desempate`);
    
    const ordenado = [...lutadores].sort((a, b) => {
      // 1º Critério: Pontos (maior primeiro)
      if (b.pontos !== a.pontos) return b.pontos - a.pontos;
      
      // Aplicar função de desempate para os demais critérios
      return this.desempatar(
        {
          id: a.lutadorId,
          vitorias: 0, // Não temos este dado diretamente no ranking
          derrotas: a.derrotas,
          vitoriasTitulo: a.vitoriasTitulo,
          vitoriasPrimeiroRound: a.vitoriasPrimeiroRound,
          vitoriasSegundoRound: a.vitoriasSegundoRound,
          vitoriasTerceiroRound: a.vitoriasTerceiroRound,
          bonus: a.bonusTotal
        },
        {
          id: b.lutadorId,
          vitorias: 0, // Não temos este dado diretamente no ranking
          derrotas: b.derrotas,
          vitoriasTitulo: b.vitoriasTitulo,
          vitoriasPrimeiroRound: b.vitoriasPrimeiroRound,
          vitoriasSegundoRound: b.vitoriasSegundoRound,
          vitoriasTerceiroRound: b.vitoriasTerceiroRound,
          bonus: b.bonusTotal
        }
      );
    });
    
    return ordenado;
  }

  /**
   * Compara dois lutadores aplicando critérios de desempate na ordem de prioridade
   * @param lutadorA - Primeiro lutador a ser comparado
   * @param lutadorB - Segundo lutador a ser comparado
   * @returns -1 se lutadorA deve ficar à frente, 1 se lutadorB deve ficar à frente, 0 se empate em todos os critérios
   */
  desempatar(lutadorA: LutadorDesempate, lutadorB: LutadorDesempate): -1 | 0 | 1 {
    // Já consideramos que a pontuação é igual, então seguimos para os outros critérios
    
    // 2º Critério: Menor número de derrotas
    if (lutadorA.derrotas < lutadorB.derrotas) return -1;
    if (lutadorA.derrotas > lutadorB.derrotas) return 1;
    
    // 3º Critério: Maior número de vitórias (incluído por completude)
    if (lutadorA.vitorias > lutadorB.vitorias) return -1;
    if (lutadorA.vitorias < lutadorB.vitorias) return 1;
    
    // 4º Critério: Maior número de vitórias em lutas de título
    if (lutadorA.vitoriasTitulo > lutadorB.vitoriasTitulo) return -1;
    if (lutadorA.vitoriasTitulo < lutadorB.vitoriasTitulo) return 1;
    
    // 5º Critério: Vitórias rápidas (por round)
    if (lutadorA.vitoriasPrimeiroRound > lutadorB.vitoriasPrimeiroRound) return -1;
    if (lutadorA.vitoriasPrimeiroRound < lutadorB.vitoriasPrimeiroRound) return 1;
    
    if (lutadorA.vitoriasSegundoRound > lutadorB.vitoriasSegundoRound) return -1;
    if (lutadorA.vitoriasSegundoRound < lutadorB.vitoriasSegundoRound) return 1;
    
    if (lutadorA.vitoriasTerceiroRound > lutadorB.vitoriasTerceiroRound) return -1;
    if (lutadorA.vitoriasTerceiroRound < lutadorB.vitoriasTerceiroRound) return 1;
    
    // 6º Critério: Maior número de bônus
    if (lutadorA.bonus > lutadorB.bonus) return -1;
    if (lutadorA.bonus < lutadorB.bonus) return 1;
    
    // Se chegou aqui, todos os critérios de desempate foram esgotados
    return 0;
  }

  /**
   * Determina a cor de fundo para um lutador com base em sua posição no ranking e número de lutas
   * @param posicao - Posição do lutador no ranking
   * @param numLutas - Número total de lutas do lutador
   * @param categoria - Categoria do ranking (opcional)
   * @returns String identificando a cor de fundo a ser aplicada
   */
  determinarCorFundo(posicao: number, numLutas: number, categoria?: string): string {
    // Cor especial para campeão com mais de 10 lutas
    if (posicao === 1 && numLutas >= 10) {
      return 'dourado-escuro';
    }
    
    if (categoria === 'Peso por Peso') {
      if (posicao === 1) {
        return 'dourado-claro';
      } else if (posicao <= 5) {
        return 'dourado-claro';
      } else if (posicao <= 15) {
        return 'azul-escuro';
      }
    } else {
      // Para outras categorias
      if (posicao === 1) {
        return 'dourado-claro';
      } else if (posicao <= 5) {
        return 'azul-escuro';
      } else if (posicao <= 15) {
        return 'azul-claro';
      }
    }
    
    return '';
  }
} 