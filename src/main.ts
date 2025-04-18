import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

// src/main.ts
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  try {
    logger.log('Iniciando a aplicação...');
    logger.log(`Diretório atual: ${process.cwd()}`);
    logger.log(`Variáveis de ambiente: DATABASE_URL=${process.env.DATABASE_URL ? 'definido' : 'não definido'}, NODE_ENV=${process.env.NODE_ENV}`);
    
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    
    const configService = app.get(ConfigService);
    
    // Configurar CORS para permitir acesso do frontend
    logger.log('Configurando CORS...');
    app.enableCors({
      origin: true, // Permitir todas as origens durante o desenvolvimento
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
      allowedHeaders: 'Content-Type,Authorization,Accept',
    });
    
    // Validação global
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    
    // Configuração do Swagger
    const config = new DocumentBuilder()
      .setTitle('UFC Ranking API')
      .setDescription('API do sistema de ranking de lutadores do UFC')
      .setVersion('1.0')
      .addTag('lutadores')
      .addTag('eventos')
      .addTag('lutas')
      .addTag('ranking')
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    
    // Testar a conexão com o banco de dados
    logger.log('Tentando conectar ao banco de dados...');
    try {
      const prismaService = app.get(PrismaService);
      await prismaService.$connect();
      // Configurar os shutdown hooks do Prisma
      await prismaService.enableShutdownHooks(app);
      logger.log('Conexão com o banco de dados estabelecida com sucesso');
    } catch (dbError) {
      logger.error(`Erro ao conectar ao banco de dados: ${dbError.message}`, dbError.stack);
      throw dbError;
    }
    
    // Configurar o encerramento limpo
    const port = configService.get<number>('PORT', 3333);
    // Alterar host para 0.0.0.0 para permitir acesso externo na nuvem
    logger.log(`Iniciando servidor na porta ${port} no host 0.0.0.0...`);
    await app.listen(port, '0.0.0.0');
    logger.log(`Aplicação iniciada na porta ${port}`);
    logger.log(`Swagger disponível em http://localhost:${port}/api`);
  } catch (error) {
    logger.error(`Erro ao inicializar o servidor: ${error.message}`, error.stack);
    process.exit(1);
  }
}
bootstrap();
