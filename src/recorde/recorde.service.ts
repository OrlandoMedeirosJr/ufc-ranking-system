import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface RecordeInfo {
  tipo: string;
  lutador: string | undefined;
  valor: number;
}

@Injectable()
export class RecordeService {
  constructor(private readonly prisma: PrismaService) {}

  async listarRecordes(): Promise<RecordeInfo[]> {
    return this.calcularRecordesAtuais();
  }

  async verificarNovosRecordes(): Promise<RecordeInfo[]> {
    const atuais = await this.calcularRecordesAtuais();
    const novos: RecordeInfo[] = [];

    for (const recorde of atuais) {
      if (
        !this.#ultimosRecordesCache[recorde.tipo] ||
        this.#ultimosRecordesCache[recorde.tipo].valor < recorde.valor
      ) {
        novos.push(recorde);
        this.#ultimosRecordesCache[recorde.tipo] = recorde;
      }
    }

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

    return recordes;
  }
}
