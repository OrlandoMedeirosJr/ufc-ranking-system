import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface RecordeInfo {
  tipo: string;
  lutador: string | undefined;
  valor: number;
  categoria?: string;
  evento?: { id: number; nome: string; data?: Date; };
}

@Injectable()
export class RecordeService {
  private readonly logger = new Logger(RecordeService.name);

  constructor(private readonly prisma: PrismaService) {}

  async listarRecordes(): Promise<RecordeInfo[]> {
    this.logger.log('Calculando lista atual de recordes');
    const recordesGerais = await this.calcularRecordesAtuais();
    const recordesPorCategoria = await this.calcularRecordesPorCategoria();
    return [...recordesGerais, ...recordesPorCategoria];
  }

  async verificarNovosRecordes(): Promise<RecordeInfo[]> {
    this.logger.log('Verificando novos recordes');
    const atuais = await this.calcularRecordesAtuais();
    const novos: RecordeInfo[] = [];

    for (const recorde of atuais) {
      const chave = recorde.categoria 
        ? `${recorde.tipo}-${recorde.categoria}` 
        : recorde.tipo;
        
      if (
        !this.#ultimosRecordesCache[chave] ||
        this.#ultimosRecordesCache[chave].valor < recorde.valor
      ) {
        this.logger.log(`Novo recorde detectado: ${recorde.tipo}${recorde.categoria ? ` (${recorde.categoria})` : ''} - ${recorde.lutador} (${recorde.valor})`);
        novos.push(recorde);
        this.#ultimosRecordesCache[chave] = recorde;
      }
    }

    this.logger.log(`Total de novos recordes: ${novos.length}`);
    return novos;
  }

  #ultimosRecordesCache: Record<string, RecordeInfo> = {};

  async calcularRecordesAtuais(): Promise<RecordeInfo[]> {
    const recordes: RecordeInfo[] = [];

    const lutas1 = await this.prisma.luta.groupBy({
      by: ['lutador1Id'],
      _count: true,
    });
    const lutas2 = await this.prisma.luta.groupBy({
      by: ['lutador2Id'],
      _count: true,
    });
    const totalLutas: Record<number, number> = {};
    for (const l of lutas1)
      totalLutas[l.lutador1Id] = (totalLutas[l.lutador1Id] || 0) + l._count;
    for (const l of lutas2)
      totalLutas[l.lutador2Id] = (totalLutas[l.lutador2Id] || 0) + l._count;

    const maisLutasId = Object.entries(totalLutas).sort(
      (a, b) => b[1] - a[1],
    )[0];
    if (maisLutasId) {
      const lutador = await this.prisma.lutador.findUnique({
        where: { id: Number(maisLutasId[0]) },
      });
      recordes.push({
        tipo: 'Mais lutas',
        lutador: lutador?.nome,
        valor: maisLutasId[1],
      });
    }

    const vitorias = await this.prisma.luta.groupBy({
      by: ['vencedorId'],
      where: { vencedorId: { not: null } },
      _count: true,
    });
    const maisVitorias = vitorias.sort((a, b) => b._count - a._count)[0];
    if (maisVitorias) {
      const lutador = await this.prisma.lutador.findUnique({
        where: { id: maisVitorias.vencedorId! },
      });
      recordes.push({
        tipo: 'Mais vitórias',
        lutador: lutador?.nome,
        valor: maisVitorias._count,
      });
    }

    const derrotas = await this.prisma.luta.findMany({
      where: { vencedorId: { not: null } },
    });
    const contadorDerrotas: Record<number, number> = {};
    for (const luta of derrotas) {
      const perdedorId =
        luta.lutador1Id === luta.vencedorId ? luta.lutador2Id : luta.lutador1Id;
      contadorDerrotas[perdedorId] = (contadorDerrotas[perdedorId] || 0) + 1;
    }
    const maisDerrotasId = Object.entries(contadorDerrotas).sort(
      (a, b) => b[1] - a[1],
    )[0];
    if (maisDerrotasId) {
      const lutador = await this.prisma.lutador.findUnique({
        where: { id: Number(maisDerrotasId[0]) },
      });
      recordes.push({
        tipo: 'Mais derrotas',
        lutador: lutador?.nome,
        valor: maisDerrotasId[1],
      });
    }

    // Calcular sequências de vitórias e derrotas
    const lutadores = await this.prisma.lutador.findMany();
    let maxVitoriaConsecutiva = { lutadorId: 0, nome: '', valor: 0 };
    let maxDerrotaConsecutiva = { lutadorId: 0, nome: '', valor: 0 };

    for (const lutador of lutadores) {
      const lutas = await this.prisma.luta.findMany({
        where: {
          OR: [
            { lutador1Id: lutador.id },
            { lutador2Id: lutador.id },
          ],
          noContest: false,
        },
        include: { evento: true }
      });

      // Ordenar lutas por data
      lutas.sort((a, b) => new Date(a.evento.data).getTime() - new Date(b.evento.data).getTime());

      let streakVitorias = 0;
      let maxStreakVitorias = 0;
      let streakDerrotas = 0;
      let maxStreakDerrotas = 0;
      
      // Sequência atual - mantém a contagem mesmo com empates
      let sequenciaAtualVitorias = 0;

      for (const luta of lutas) {
        const venceu = luta.vencedorId === lutador.id;
        const perdeu = luta.vencedorId && luta.vencedorId !== lutador.id;
        const empate = !luta.vencedorId && !luta.noContest;

        if (venceu) {
          sequenciaAtualVitorias++;
          streakVitorias = sequenciaAtualVitorias;
          if (streakVitorias > maxStreakVitorias) {
            maxStreakVitorias = streakVitorias;
          }
          streakDerrotas = 0;
        } else if (perdeu) {
          streakDerrotas++;
          if (streakDerrotas > maxStreakDerrotas) {
            maxStreakDerrotas = streakDerrotas;
          }
          sequenciaAtualVitorias = 0;
          streakVitorias = 0;
        } else if (empate) {
          // Em caso de empate, mantém a sequência atual de vitórias
          // mas zera a sequência de derrotas
          streakDerrotas = 0;
        } else {
          // No contest - não altera sequências
        }
      }

      if (maxStreakVitorias > maxVitoriaConsecutiva.valor) {
        maxVitoriaConsecutiva = { 
          lutadorId: lutador.id, 
          nome: lutador.nome, 
          valor: maxStreakVitorias 
        };
      }

      if (maxStreakDerrotas > maxDerrotaConsecutiva.valor) {
        maxDerrotaConsecutiva = { 
          lutadorId: lutador.id, 
          nome: lutador.nome, 
          valor: maxStreakDerrotas 
        };
      }
    }

    if (maxVitoriaConsecutiva.valor > 0) {
      recordes.push({
        tipo: 'Mais vitórias consecutivas',
        lutador: maxVitoriaConsecutiva.nome,
        valor: maxVitoriaConsecutiva.valor,
      });
    }

    if (maxDerrotaConsecutiva.valor > 0) {
      recordes.push({
        tipo: 'Mais derrotas consecutivas',
        lutador: maxDerrotaConsecutiva.nome,
        valor: maxDerrotaConsecutiva.valor,
      });
    }

    const lutas = await this.prisma.luta.findMany({
      where: { vencedorId: { not: null } },
    });
    const stats: Record<
      number,
      { noc: number; fin: number; dec: number; bonus: number }
    > = {};

    for (const luta of lutas) {
      const id = luta.vencedorId!;
      if (!stats[id]) stats[id] = { noc: 0, fin: 0, dec: 0, bonus: 0 };

      const metodo = luta.metodoVitoria?.toLowerCase();
      if (metodo === 'nocaute') stats[id].noc++;
      if (metodo === 'finalização') stats[id].fin++;
      if (metodo?.includes('decisão')) stats[id].dec++;

      if (luta.bonus) {
        const bonusList = luta.bonus.split(',');
        stats[id].bonus += bonusList.length;
      }
    }

    const maxPor = async (
      campo: 'noc' | 'fin' | 'dec' | 'bonus',
      tipo: string,
    ) => {
      const ordenado = Object.entries(stats).sort(
        (a, b) => b[1][campo] - a[1][campo],
      )[0];
      if (ordenado) {
        const l = await this.prisma.lutador.findUnique({
          where: { id: Number(ordenado[0]) },
        });
        recordes.push({ tipo, lutador: l?.nome, valor: ordenado[1][campo] });
      }
    };

    await Promise.all([
      maxPor('noc', 'Mais nocautes'),
      maxPor('fin', 'Mais finalizações'),
      maxPor('dec', 'Mais vitórias por decisão'),
      maxPor('bonus', 'Mais bônus da noite'),
    ]);

    // Calcular eventos mais populares/lucrativos
    try {
      // Evento com maior público
      const eventoMaiorPublico = await this.prisma.evento.findFirst({
        where: { 
          finalizado: true,
          publicoTotal: { not: null }
        },
        orderBy: { publicoTotal: 'desc' },
        select: { id: true, nome: true, data: true, publicoTotal: true }
      });

      if (eventoMaiorPublico && eventoMaiorPublico.publicoTotal) {
        recordes.push({
          tipo: 'Maior público',
          lutador: undefined,
          valor: eventoMaiorPublico.publicoTotal,
          evento: {
            id: eventoMaiorPublico.id,
            nome: eventoMaiorPublico.nome,
            data: eventoMaiorPublico.data
          }
        });
      }

      // Evento com maior arrecadação
      const eventoMaiorArrecadacao = await this.prisma.evento.findFirst({
        where: { 
          finalizado: true,
          arrecadacao: { not: null }
        },
        orderBy: { arrecadacao: 'desc' },
        select: { id: true, nome: true, data: true, arrecadacao: true }
      });

      if (eventoMaiorArrecadacao && eventoMaiorArrecadacao.arrecadacao) {
        recordes.push({
          tipo: 'Maior arrecadação',
          lutador: undefined,
          valor: eventoMaiorArrecadacao.arrecadacao,
          evento: {
            id: eventoMaiorArrecadacao.id,
            nome: eventoMaiorArrecadacao.nome,
            data: eventoMaiorArrecadacao.data
          }
        });
      }
    } catch (error) {
      this.logger.error(`Erro ao calcular recordes de eventos: ${error.message}`);
    }

    return recordes;
  }

  async calcularRecordesPorCategoria(): Promise<RecordeInfo[]> {
    const recordes: RecordeInfo[] = [];
    const categorias = [
      'Peso Mosca',
      'Peso Galo',
      'Peso Pena',
      'Peso Leve',
      'Peso Meio-Médio',
      'Peso Médio',
      'Peso Meio-Pesado',
      'Peso Pesado',
      'Peso Mosca Feminino',
      'Peso Palha Feminino',
      'Peso Galo Feminino',
      'Peso Pena Feminino'
    ];

    for (const categoria of categorias) {
      // Obter lutadores da categoria
      const lutadoresCategoria = await this.prisma.lutador.findMany({
        where: { categoriaAtual: categoria }
      });
      
      if (lutadoresCategoria.length === 0) continue;
      
      const lutadoresIds = lutadoresCategoria.map(l => l.id);
      
      // Mais lutas na categoria
      const lutasCategoria: Record<number, number> = {};
      for (const lutadorId of lutadoresIds) {
        const lutas = await this.prisma.luta.count({
          where: {
            OR: [
              { lutador1Id: lutadorId },
              { lutador2Id: lutadorId }
            ],
            categoria: categoria
          }
        });
        if (lutas > 0) {
          lutasCategoria[lutadorId] = lutas;
        }
      }
      
      const maisLutasCategoria = Object.entries(lutasCategoria)
        .sort((a, b) => Number(b[1]) - Number(a[1]))[0];
        
      if (maisLutasCategoria && Number(maisLutasCategoria[1]) > 0) {
        const lutador = await this.prisma.lutador.findUnique({
          where: { id: Number(maisLutasCategoria[0]) }
        });
        recordes.push({
          tipo: 'Mais lutas',
          lutador: lutador?.nome,
          valor: Number(maisLutasCategoria[1]),
          categoria
        });
      }
      
      // Mais vitórias na categoria
      const vitoriasCategoria: Record<number, number> = {};
      for (const lutadorId of lutadoresIds) {
        const vitorias = await this.prisma.luta.count({
          where: {
            vencedorId: lutadorId,
            categoria: categoria
          }
        });
        if (vitorias > 0) {
          vitoriasCategoria[lutadorId] = vitorias;
        }
      }
      
      const maisVitoriasCategoria = Object.entries(vitoriasCategoria)
        .sort((a, b) => Number(b[1]) - Number(a[1]))[0];
        
      if (maisVitoriasCategoria && Number(maisVitoriasCategoria[1]) > 0) {
        const lutador = await this.prisma.lutador.findUnique({
          where: { id: Number(maisVitoriasCategoria[0]) }
        });
        recordes.push({
          tipo: 'Mais vitórias',
          lutador: lutador?.nome,
          valor: Number(maisVitoriasCategoria[1]),
          categoria
        });
      }
      
      // Mais vitórias consecutivas na categoria
      let maxVitoriaConsecutivaCategoria = { lutadorId: 0, nome: '', valor: 0 };
      
      for (const lutador of lutadoresCategoria) {
        const lutas = await this.prisma.luta.findMany({
          where: {
            OR: [
              { lutador1Id: lutador.id },
              { lutador2Id: lutador.id }
            ],
            categoria: categoria,
            noContest: false
          },
          include: { evento: true }
        });
        
        // Ordenar lutas por data
        lutas.sort((a, b) => new Date(a.evento.data).getTime() - new Date(b.evento.data).getTime());
        
        let streakVitorias = 0;
        let maxStreakVitorias = 0;
        
        // Sequência atual - mantém a contagem mesmo com empates
        let sequenciaAtualVitorias = 0;
        
        for (const luta of lutas) {
          const venceu = luta.vencedorId === lutador.id;
          const perdeu = luta.vencedorId && luta.vencedorId !== lutador.id;
          const empate = !luta.vencedorId && !luta.noContest;
          
          if (venceu) {
            sequenciaAtualVitorias++;
            streakVitorias = sequenciaAtualVitorias;
            if (streakVitorias > maxStreakVitorias) {
              maxStreakVitorias = streakVitorias;
            }
          } else if (perdeu) {
            sequenciaAtualVitorias = 0;
            streakVitorias = 0;
          } else if (empate) {
            // Em caso de empate, mantém a sequência atual de vitórias
          } else {
            // No contest - não altera sequências
          }
        }
        
        if (maxStreakVitorias > maxVitoriaConsecutivaCategoria.valor) {
          maxVitoriaConsecutivaCategoria = {
            lutadorId: lutador.id,
            nome: lutador.nome,
            valor: maxStreakVitorias
          };
        }
      }
      
      if (maxVitoriaConsecutivaCategoria.valor > 0) {
        recordes.push({
          tipo: 'Mais vitórias consecutivas',
          lutador: maxVitoriaConsecutivaCategoria.nome,
          valor: maxVitoriaConsecutivaCategoria.valor,
          categoria
        });
      }
    }
    
    return recordes;
  }
}
