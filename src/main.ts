import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { Logger } from '@nestjs/common';

// src/main.ts
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  try {
    const app = await NestFactory.create(AppModule);
    
    // Habilitar CORS para permitir solicitações do frontend
    app.enableCors({
      origin: true, // Permitir qualquer origem
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });
    
    // Testar a conexão com o banco de dados
    const prismaService = app.get(PrismaService);
    await prismaService.$connect();
    // Configurar os shutdown hooks do Prisma
    await prismaService.enableShutdownHooks(app);
    logger.log('Conexão com o banco de dados estabelecida com sucesso');
    
    // Configurar o encerramento limpo
    const port = process.env.PORT || 3000;
    // Alterar host para 0.0.0.0 para permitir acesso externo na nuvem
    await app.listen(port, '0.0.0.0');
    logger.log(`Aplicação iniciada na porta ${port}`);
  } catch (error) {
    logger.error(`Erro ao inicializar o servidor: ${error.message}`, error.stack);
    process.exit(1);
  }
}
bootstrap();
