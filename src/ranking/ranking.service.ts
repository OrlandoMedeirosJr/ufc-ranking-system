import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RankingService {
  constructor(private readonly prisma: PrismaService) {}

  async calcularPontuacaoLutador(lutadorId: number) {
    const lutas = await this.prisma.luta.findMany({
      where: {
        OR: [{ lutador1Id: lutadorId }, { lutador2Id: lutadorId }],
      },
      orderBy: { createdAt: 'asc' },
    });

    let pontos = 0;
    let streakVitorias = 0;
    let streakDerrotas = 0;
    let bonusTotal = 0;
    let vitoriasPrimeiroRound = 0;
    let vitoriasSegundoRound = 0;
    let vitoriasTerceiroRound = 0;
    let vitoriasTitulo = 0;
    let derrotas = 0;

    for (const luta of lutas) {
      const venceu = luta.vencedorId === lutadorId;
      const perdeu = luta.vencedorId && luta.vencedorId !== lutadorId;
      const empate = !luta.vencedorId;

      if (luta.noContest) continue;

      const metodo = luta.metodoVitoria?.toLowerCase() ?? '';
      const round = luta.round ?? 0;
      const isTitulo = luta.disputaTitulo;

      if (venceu) {
        pontos += 3;

        if (metodo === 'nocaute' || metodo === 'finalização') {
          pontos += 6 - round;
          if (round === 1) vitoriasPrimeiroRound++;
          if (round === 2) vitoriasSegundoRound++;
          if (round === 3) vitoriasTerceiroRound++;
        }

        if (metodo.includes('decisão unânime')) pontos += 2;
        else if (metodo.includes('decisão dividida')) pontos += 1;
        else if (metodo.includes('desclassificação')) pontos += 1;

        if (isTitulo) {
          pontos += 3;
          vitoriasTitulo++;
        }

        streakVitorias++;
        streakDerrotas = 0;
      } else if (perdeu) {
        if (isTitulo) {
          pontos -= 2;
        } else {
          if (metodo === 'nocaute') pontos -= 5;
          else if (metodo === 'finalização') pontos -= 5;
          else if (metodo.includes('decisão unânime')) pontos -= 3;
          else if (metodo.includes('decisão dividida')) pontos -= 2;
          else if (metodo.includes('desclassificação')) pontos -= 2;
        }

        derrotas++;
        streakDerrotas++;
        streakVitorias = 0;
      } else if (empate) {
        pontos += 1;
        streakVitorias = 0;
        streakDerrotas = 0;
      }

      if (luta.bonus) {
        if (luta.bonus === 'Performance da Noite') {
          if (venceu) {
            pontos += 1;
            bonusTotal++;
          }
        }
        
        if (luta.bonus === 'Luta da Noite') {
          pontos += 1;
          bonusTotal++;
        }
      }

      if (streakVitorias === 2) pontos += 1;
      else if (streakVitorias === 3) pontos += 2;
      else if (streakVitorias === 4) pontos += 3;
      else if (streakVitorias >= 5) pontos += 4;

      if (streakDerrotas === 2) pontos -= 1;
      else if (streakDerrotas === 3) pontos -= 2;
      else if (streakDerrotas === 4) pontos -= 3;
      else if (streakDerrotas >= 5) pontos -= 4;
    }

    return {
      pontos,
      vitoriasTitulo,
      vitoriasPrimeiroRound,
      vitoriasSegundoRound,
      vitoriasTerceiroRound,
      bonusTotal,
      derrotas,
    };
  }

  async atualizarTodosOsRankings() {
    const lutadores = await this.prisma.lutador.findMany();
    const rankingAnterior = await this.prisma.ranking.findMany();
    const rankingMap: Record<string, any[]> = {};

    // Armazenar o número total de lutas por lutador
    const lutasMap: Record<number, number> = {};
    
    // Pré-carregar o número de lutas para cada lutador
    for (const lutador of lutadores) {
      const totalLutas = await this.prisma.luta.count({
        where: {
          OR: [{ lutador1Id: lutador.id }, { lutador2Id: lutador.id }],
          noContest: false
        }
      });
      lutasMap[lutador.id] = totalLutas;
    }

    for (const lutador of lutadores) {
      const resultado = await this.calcularPontuacaoLutador(lutador.id);

      const lutas = await this.prisma.luta.findMany({
        where: {
          OR: [{ lutador1Id: lutador.id }, { lutador2Id: lutador.id }],
          noContest: false,
        },
        select: { categoria: true },
        distinct: ['categoria'],
      });

      for (const l of lutas) {
        const categoria = l.categoria;
        if (!rankingMap[categoria]) rankingMap[categoria] = [];

        rankingMap[categoria].push({
          lutadorId: lutador.id,
          nome: lutador.nome,
          totalLutas: lutasMap[lutador.id],
          ...resultado,
        });
      }

      if (!rankingMap['Peso por Peso']) rankingMap['Peso por Peso'] = [];
      rankingMap['Peso por Peso'].push({
        lutadorId: lutador.id,
        nome: lutador.nome,
        totalLutas: lutasMap[lutador.id],
        ...resultado,
      });
    }

    await this.prisma.ranking.deleteMany();

    for (const [categoria, lutadores] of Object.entries(rankingMap)) {
      const ordenado = lutadores.sort((a, b) => {
        if (b.pontos !== a.pontos) return b.pontos - a.pontos;
        if (a.derrotas !== b.derrotas) return a.derrotas - b.derrotas;
        if (b.vitoriasTitulo !== a.vitoriasTitulo)
          return b.vitoriasTitulo - a.vitoriasTitulo;
        if (b.vitoriasPrimeiroRound !== a.vitoriasPrimeiroRound)
          return b.vitoriasPrimeiroRound - a.vitoriasPrimeiroRound;
        if (b.vitoriasSegundoRound !== a.vitoriasSegundoRound)
          return b.vitoriasSegundoRound - a.vitoriasSegundoRound;
        if (b.vitoriasTerceiroRound !== a.vitoriasTerceiroRound)
          return b.vitoriasTerceiroRound - a.vitoriasTerceiroRound;
        if (b.bonusTotal !== a.bonusTotal) return b.bonusTotal - a.bonusTotal;
        return 0;
      });

      for (let i = 0; i < ordenado.length; i++) {
        const entry = ordenado[i];
        const posicao = i + 1;

        let cor = '';
        // Aplicar cor dourado-escuro apenas se for primeiro colocado E tiver pelo menos 10 lutas
        if (posicao === 1 && entry.totalLutas >= 10) cor = 'dourado-escuro';
        // Primeiro colocado com menos de 10 lutas ou posições 2-5 no ranking Peso por Peso recebem dourado-claro
        else if ((posicao === 1 && entry.totalLutas < 10) || (categoria === 'Peso por Peso' && posicao >= 2 && posicao <= 5))
          cor = 'dourado-claro';
        else if (categoria === 'Peso por Peso' && posicao >= 6 && posicao <= 15)
          cor = 'azul-escuro';
        else if (posicao >= 2 && posicao <= 5) cor = 'azul-escuro';
        else if (posicao >= 6 && posicao <= 15) cor = 'azul-claro';

        const anterior = rankingAnterior.find(
          (r) => r.lutadorId === entry.lutadorId && r.categoria === categoria,
        );
        const variacao = anterior ? anterior.posicao - posicao : 0;

        await this.prisma.ranking.create({
          data: {
            lutadorId: entry.lutadorId,
            categoria,
            posicao,
            pontos: entry.pontos,
            corFundo: cor,
            variacao,
          },
        });
      }
    }

    console.log('✅ Ranking atualizado com sucesso.');
  }

  async getRankingPorCategoria(categoria: string) {
    return this.prisma.ranking.findMany({
      where: { categoria },
      orderBy: { posicao: 'asc' },
      include: { lutador: true },
    });
  }
}
