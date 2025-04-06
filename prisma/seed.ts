import { PrismaClient, Lutador } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const paises = ['Brasil', 'EUA', 'Rússia', 'Nigéria', 'México'];
  const sexos = ['Masculino', 'Feminino'];
  const categorias = [
    'Peso Leve', 'Peso Meio Medio', 'Peso Pesado',
    'Peso Pena Feminino', 'Peso Mosca Feminino', 'Peso Galo Feminino'
  ];

  console.log('📌 Limpando banco de dados...');
  await prisma.luta.deleteMany();
  await prisma.ranking.deleteMany();
  await prisma.evento.deleteMany();
  await prisma.lutador.deleteMany();

  console.log('📌 Criando lutadores...');
  const lutadores: Lutador[] = [];
  for (let i = 1; i <= 50; i++) {
    const categoriaAleatoria = categorias[Math.floor(Math.random() * categorias.length)];
    const lutador = await prisma.lutador.create({
      data: {
        nome: `Lutador ${i}`,
        apelido: i % 3 === 0 ? `Apelido ${i}` : null,
        pais: paises[i % paises.length],
        sexo: sexos[i % sexos.length],
        altura: 1.7 + (Math.random() * 0.3),
        categoriaAtual: categoriaAleatoria
      },
    });
    lutadores.push(lutador);
  }

  console.log('📌 Criando eventos e lutas...');
  for (let e = 1; e <= 20; e++) {
    // Gerar dados aleatórios para público, arrecadação e PPV
    const publicoTotal = Math.floor(Math.random() * 15000) + 5000; // Entre 5.000 e 20.000
    const arrecadacao = (Math.random() * 5000000) + 1000000; // Entre 1M e 6M
    const payPerView = Math.floor(Math.random() * 800000) + 200000; // Entre 200k e 1M
    
    const evento = await prisma.evento.create({
      data: {
        nome: `UFC ${280 + e}`,
        local: 'Arena XYZ',
        pais: paises[e % paises.length],
        data: new Date(2025, e % 12, (e % 28) + 1),
        finalizado: true,
        publicoTotal,
        arrecadacao,
        payPerView
      }
    });

    for (let l = 1; l <= 10; l++) {
      // Selecionar dois lutadores aleatórios diferentes
      const lutador1Index = Math.floor(Math.random() * lutadores.length);
      let lutador2Index = Math.floor(Math.random() * lutadores.length);
      while (lutador2Index === lutador1Index) {
        lutador2Index = Math.floor(Math.random() * lutadores.length);
      }

      const lutador1 = lutadores[lutador1Index];
      const lutador2 = lutadores[lutador2Index];
      
      const vencedorId = Math.random() < 0.5 ? lutador1.id : lutador2.id;
      const round = Math.floor(Math.random() * 5) + 1;
      const bonus = Math.random() < 0.5 ? 'performance' : 'luta da noite';
      const metodo = ['Nocaute', 'Finalização', 'Decisão Unânime', 'Decisão Dividida'][Math.floor(Math.random() * 4)];
      const categoria = lutador1.categoriaAtual; // Usar a categoria do lutador 1

      try {
        await prisma.luta.create({
          data: {
            eventoId: evento.id,
            lutador1Id: lutador1.id,
            lutador2Id: lutador2.id,
            vencedorId,
            round,
            metodoVitoria: metodo,
            bonus,
            categoria,
            disputaTitulo: Math.random() < 0.1,
            noContest: false
          }
        });
      } catch (error) {
        console.error(`Erro ao criar luta: ${error}`);
      }
    }
  }

  console.log('🚀 Criando ranking inicial...');
  // Criar ranking para "Peso por Peso"
  for (let i = 0; i < Math.min(15, lutadores.length); i++) {
    await prisma.ranking.create({
      data: {
        lutadorId: lutadores[i].id,
        categoria: 'Peso por Peso',
        posicao: i + 1,
        pontos: 100 - (i * 5),
        corFundo: i === 0 ? 'dourado-escuro' : 
                 i < 5 ? 'dourado-claro' : 
                 i < 15 ? 'azul-escuro' : ''
      }
    });
  }

  // Criar rankings para categorias específicas
  for (const categoria of categorias) {
    const lutadoresCategoria = lutadores.filter(l => l.categoriaAtual === categoria);
    for (let i = 0; i < Math.min(15, lutadoresCategoria.length); i++) {
      await prisma.ranking.create({
        data: {
          lutadorId: lutadoresCategoria[i].id,
          categoria,
          posicao: i + 1,
          pontos: 100 - (i * 5),
          corFundo: i === 0 ? 'dourado-escuro' : 
                   i < 5 ? 'dourado-claro' : 
                   i < 15 ? 'azul-escuro' : ''
        }
      });
    }
  }

  console.log('✅ Seed concluído com sucesso!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
