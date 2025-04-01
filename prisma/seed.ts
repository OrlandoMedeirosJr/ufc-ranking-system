import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const paises = ['Brasil', 'EUA', 'Rússia', 'Nigéria', 'México'];
  const sexos = ['Masculino', 'Feminino'];
  const categorias = [
    'Peso Leve', 'Peso Meio Medio', 'Peso Pesado',
    'Peso Pena Feminino', 'Peso Mosca Feminino', 'Peso Galo Feminino'
  ];

  console.log('📌 Criando lutadores...');
  for (let i = 1; i <= 50; i++) {
    await prisma.lutador.create({
      data: {
        nome: `Lutador ${i}`,
        pais: paises[i % paises.length],
        sexo: sexos[i % sexos.length],
      },
    });
  }

  console.log('📌 Criando eventos e lutas...');
  for (let e = 1; e <= 20; e++) {
    const evento = await prisma.evento.create({
      data: {
        nome: `UFC ${280 + e}`,
        local: 'Arena XYZ',
        cidadeEstado: 'Cidade YZ',
        data: new Date(2025, e % 12, (e % 28) + 1),
        publicoTotal: 15000 + e * 100,
        arrecadacao: 2000000 + e * 50000,
        payPerView: 800000 + e * 25000,
        finalizado: true
      }
    });

    for (let l = 1; l <= 10; l++) {
      const lutador1Id = Math.floor(Math.random() * 50) + 1;
      let lutador2Id = Math.floor(Math.random() * 50) + 1;
      while (lutador2Id === lutador1Id) {
        lutador2Id = Math.floor(Math.random() * 50) + 1;
      }

      const vencedorId = Math.random() < 0.5 ? lutador1Id : lutador2Id;
      const round = Math.floor(Math.random() * 5) + 1;
      const bonus = Math.random() < 0.5 ? 'performance' : 'luta da noite';
      const metodo = ['Nocaute', 'Finalização', 'Decisão Unânime', 'Decisão Dividida'][Math.floor(Math.random() * 4)];
      const categoria = categorias[Math.floor(Math.random() * categorias.length)];

      await prisma.luta.create({
        data: {
          eventoId: evento.id,
          lutador1Id,
          lutador2Id,
          vencedorId,
          round,
          metodoVitoria: metodo,
          bonus,
          categoria,
          disputaTitulo: Math.random() < 0.1,
          noContest: false
        }
      });
    }
  }

  console.log('🚀 Finalizando ranking inicial...');
  await prisma.ranking.deleteMany(); // limpa anteriores se existirem
  console.log('✅ Seed concluído com sucesso!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
