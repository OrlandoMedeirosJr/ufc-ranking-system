import { Injectable, Logger } from '@nestjs/common';

/**
 * Interface para representar uma luta com seus relacionamentos
 */
interface LutaComRelacionamentos {
  id: number;
  vencedorId: number | null;
  lutador1Id: number;
  lutador2Id: number;
  metodoVitoria: string | null;
  round: number | null;
  disputaTitulo: boolean;
  noContest: boolean;
  bonus: string | null;
}

/**
 * Interface para representar os pontos atribuídos para cada lutador em uma luta
 */
interface PontosPorLutador {
  lutador1: {
    pontos: number;
    bonusCount: number;
    vitoriasTitulo: number;
    vitoriasPrimeiroRound: number;
    vitoriasSegundoRound: number;
    vitoriasTerceiroRound: number;
    vitoria: boolean;
    derrota: boolean;
  };
  lutador2: {
    pontos: number;
    bonusCount: number;
    vitoriasTitulo: number;
    vitoriasPrimeiroRound: number;
    vitoriasSegundoRound: number;
    vitoriasTerceiroRound: number;
    vitoria: boolean;
    derrota: boolean;
  };
}

@Injectable()
export class PontuacaoService {
  private readonly logger = new Logger(PontuacaoService.name);

  /**
   * Calcula toda a pontuação para ambos os lutadores em uma luta
   * @param luta - Dados da luta e seus relacionamentos
   * @returns Objeto com a pontuação de cada lutador
   */
  calcularPontuacao(luta: LutaComRelacionamentos): PontosPorLutador {
    if (luta.noContest) {
      return this.gerarPontuacaoZerada(luta);
    }

    const lutador1Venceu = luta.vencedorId === luta.lutador1Id;
    const lutador2Venceu = luta.vencedorId === luta.lutador2Id;
    const empate = !luta.vencedorId;
    const metodo = luta.metodoVitoria?.toLowerCase() ?? '';
    const round = luta.round ?? 0;
    const isTitulo = luta.disputaTitulo;

    const resultado: PontosPorLutador = {
      lutador1: {
        pontos: 0,
        bonusCount: 0,
        vitoriasTitulo: 0,
        vitoriasPrimeiroRound: 0,
        vitoriasSegundoRound: 0,
        vitoriasTerceiroRound: 0,
        vitoria: lutador1Venceu,
        derrota: lutador2Venceu
      },
      lutador2: {
        pontos: 0,
        bonusCount: 0,
        vitoriasTitulo: 0,
        vitoriasPrimeiroRound: 0,
        vitoriasSegundoRound: 0,
        vitoriasTerceiroRound: 0,
        vitoria: lutador2Venceu,
        derrota: lutador1Venceu
      }
    };

    // Calcular pontuação base
    resultado.lutador1.pontos += this.calcularPontuacaoBase(lutador1Venceu, lutador2Venceu, empate);
    resultado.lutador2.pontos += this.calcularPontuacaoBase(lutador2Venceu, lutador1Venceu, empate);

    // Calcular bônus por método
    resultado.lutador1.pontos += this.calcularBonusPorMetodo(lutador1Venceu, metodo, round);
    resultado.lutador2.pontos += this.calcularBonusPorMetodo(lutador2Venceu, metodo, round);

    // Calcular pontuação por luta de título
    resultado.lutador1.pontos += this.calcularPontuacaoTitulo(lutador1Venceu, isTitulo);
    resultado.lutador2.pontos += this.calcularPontuacaoTitulo(lutador2Venceu, isTitulo);

    // Calcular penalidades por derrota
    resultado.lutador1.pontos += this.calcularPenalidadeDerrota(lutador2Venceu, metodo, isTitulo);
    resultado.lutador2.pontos += this.calcularPenalidadeDerrota(lutador1Venceu, metodo, isTitulo);

    // Processar bônus especial
    const bonusEspecialLutador1 = this.calcularBonusEspecial(luta.bonus, lutador1Venceu);
    const bonusEspecialLutador2 = this.calcularBonusEspecial(luta.bonus, lutador2Venceu);
    
    resultado.lutador1.pontos += bonusEspecialLutador1.pontos;
    resultado.lutador1.bonusCount += bonusEspecialLutador1.bonusCount;
    
    resultado.lutador2.pontos += bonusEspecialLutador2.pontos;
    resultado.lutador2.bonusCount += bonusEspecialLutador2.bonusCount;

    // Atualizar estatísticas para desempate
    if (lutador1Venceu) {
      const vitoriasRound = this.contabilizarVitoriaPorRound(lutador1Venceu, metodo, round);
      resultado.lutador1.vitoriasPrimeiroRound = vitoriasRound.vitoriasPrimeiroRound;
      resultado.lutador1.vitoriasSegundoRound = vitoriasRound.vitoriasSegundoRound;
      resultado.lutador1.vitoriasTerceiroRound = vitoriasRound.vitoriasTerceiroRound;
      resultado.lutador1.vitoriasTitulo = isTitulo ? 1 : 0;
    }

    if (lutador2Venceu) {
      const vitoriasRound = this.contabilizarVitoriaPorRound(lutador2Venceu, metodo, round);
      resultado.lutador2.vitoriasPrimeiroRound = vitoriasRound.vitoriasPrimeiroRound;
      resultado.lutador2.vitoriasSegundoRound = vitoriasRound.vitoriasSegundoRound;
      resultado.lutador2.vitoriasTerceiroRound = vitoriasRound.vitoriasTerceiroRound;
      resultado.lutador2.vitoriasTitulo = isTitulo ? 1 : 0;
    }

    return resultado;
  }

  /**
   * Gera um objeto de pontuação zerado para No Contest
   */
  private gerarPontuacaoZerada(luta: LutaComRelacionamentos): PontosPorLutador {
    return {
      lutador1: {
        pontos: 0,
        bonusCount: 0,
        vitoriasTitulo: 0,
        vitoriasPrimeiroRound: 0,
        vitoriasSegundoRound: 0,
        vitoriasTerceiroRound: 0,
        vitoria: false,
        derrota: false
      },
      lutador2: {
        pontos: 0,
        bonusCount: 0,
        vitoriasTitulo: 0,
        vitoriasPrimeiroRound: 0,
        vitoriasSegundoRound: 0,
        vitoriasTerceiroRound: 0,
        vitoria: false,
        derrota: false
      }
    };
  }

  /**
   * Calcula a pontuação base de acordo com o resultado da luta
   * @param venceu - Se o lutador venceu a luta
   * @param perdeu - Se o lutador perdeu a luta
   * @param empate - Se a luta terminou em empate
   * @returns Pontos base
   */
  calcularPontuacaoBase(venceu: boolean, perdeu: boolean, empate: boolean): number {
    if (venceu) return 3;
    if (empate) return 1;
    return 0; // Se perdeu, não ganha pontos base
  }

  /**
   * Calcula pontos bônus baseado no método de vitória e round
   * @param venceu - Se o lutador venceu a luta
   * @param metodo - Método de vitória
   * @param round - Round em que a luta terminou
   * @returns Pontos bônus
   */
  calcularBonusPorMetodo(venceu: boolean, metodo: string, round: number): number {
    if (!venceu) return 0;

    let pontos = 0;
    const metodoLowerCase = metodo.toLowerCase();

    if (metodoLowerCase === 'nocaute' || metodoLowerCase === 'finalização') {
      pontos += 6 - round; // 5 pontos no round 1, 4 no round 2, etc.
    } else if (metodoLowerCase.includes('decisão unânime')) {
      pontos += 2;
    } else if (metodoLowerCase.includes('decisão dividida')) {
      pontos += 1;
    } else if (metodoLowerCase.includes('desclassificação')) {
      pontos += 1;
    }

    return pontos;
  }

  /**
   * Calcula a pontuação adicional por luta de título
   * @param venceu - Se o lutador venceu a luta
   * @param isTitulo - Se a luta foi por título
   * @returns Pontos adicionais
   */
  calcularPontuacaoTitulo(venceu: boolean, isTitulo: boolean): number {
    if (!isTitulo) return 0;
    
    return venceu ? 3 : -2; // +3 para vitória em luta de título, -2 para derrota
  }

  /**
   * Calcula penalidade por derrota baseado no método e tipo da luta
   * @param perdeu - Se o lutador perdeu a luta
   * @param metodo - Método de derrota
   * @param isTitulo - Se a luta foi por título
   * @returns Pontos de penalidade (valor negativo)
   */
  calcularPenalidadeDerrota(perdeu: boolean, metodo: string, isTitulo: boolean): number {
    if (!perdeu || isTitulo) return 0; // Se não perdeu ou é luta de título, não tem penalidade aqui

    const metodoLowerCase = metodo.toLowerCase();
    
    if (metodoLowerCase === 'nocaute' || metodoLowerCase === 'finalização') {
      return -5;
    } else if (metodoLowerCase.includes('decisão unânime')) {
      return -3;
    } else if (metodoLowerCase.includes('decisão dividida')) {
      return -2;
    } else if (metodoLowerCase.includes('desclassificação')) {
      return -2;
    }
    
    return 0;
  }

  /**
   * Calcula bônus por sequência de vitórias ou derrotas
   * @param streakVitorias - Número de vitórias consecutivas
   * @param streakDerrotas - Número de derrotas consecutivas
   * @returns Pontos bônus ou penalidade
   */
  calcularBonusSequencia(streakVitorias: number, streakDerrotas: number): number {
    let pontos = 0;
    
    // Bônus de sequência de vitórias
    if (streakVitorias === 2) pontos += 1;
    else if (streakVitorias === 3) pontos += 2;
    else if (streakVitorias === 4) pontos += 3;
    else if (streakVitorias >= 5) pontos += 4;

    // Penalização por sequência de derrotas
    if (streakDerrotas === 2) pontos -= 1;
    else if (streakDerrotas === 3) pontos -= 2;
    else if (streakDerrotas === 4) pontos -= 3;
    else if (streakDerrotas >= 5) pontos -= 4;
    
    return pontos;
  }

  /**
   * Calcula bônus por Performance da Noite ou Luta da Noite
   * @param bonus - String contendo os bônus recebidos
   * @param venceu - Se o lutador venceu a luta
   * @returns Objeto com pontos e contador de bônus
   */
  calcularBonusEspecial(bonus: string | null, venceu: boolean): { pontos: number, bonusCount: number } {
    if (!bonus) return { pontos: 0, bonusCount: 0 };
    
    let pontos = 0;
    let bonusCount = 0;
    
    // Tratar múltiplos bônus separados por vírgula
    const bonuses = typeof bonus === 'string' ? 
                    bonus.split(',').map(b => b.trim()) : 
                    [bonus];
    
    for (const bonusItem of bonuses) {
      if (bonusItem === 'Performance da Noite') {
        if (venceu) {
          pontos += 1;
          bonusCount++;
        }
      }
      
      if (bonusItem === 'Luta da Noite') {
        pontos += 1;
        bonusCount++;
      }
    }
    
    return { pontos, bonusCount };
  }

  /**
   * Contabiliza vitórias por round para critérios de desempate
   * @param venceu - Se o lutador venceu a luta
   * @param metodo - Método de vitória
   * @param round - Round em que a luta terminou
   * @returns Objeto com contagens de vitórias por round
   */
  contabilizarVitoriaPorRound(venceu: boolean, metodo: string, round: number): { 
    vitoriasPrimeiroRound: number,
    vitoriasSegundoRound: number,
    vitoriasTerceiroRound: number
  } {
    const resultado = {
      vitoriasPrimeiroRound: 0,
      vitoriasSegundoRound: 0,
      vitoriasTerceiroRound: 0
    };

    if (!venceu) return resultado;

    const metodoLowerCase = metodo.toLowerCase();
    if (metodoLowerCase !== 'nocaute' && metodoLowerCase !== 'finalização') return resultado;

    if (round === 1) resultado.vitoriasPrimeiroRound = 1;
    else if (round === 2) resultado.vitoriasSegundoRound = 1;
    else if (round === 3) resultado.vitoriasTerceiroRound = 1;

    return resultado;
  }
} 