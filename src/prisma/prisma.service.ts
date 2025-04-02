import { Injectable, OnModuleInit, INestApplication, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);
  
  constructor() {
    super({
      log: [
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
      errorFormat: 'pretty',
    });
  }
  
  async onModuleInit() {
    try {
      this.logger.log('Tentando conectar ao Prisma...');
      this.logger.log(`URL do banco de dados: ${process.env.DATABASE_URL ? 'definida' : 'não definida'}`);
      await this.$connect();
      this.logger.log('Prisma conectado com sucesso');
    } catch (error) {
      this.logger.error(`Erro ao conectar ao banco de dados: ${error.message}`, error.stack);
      
      // Tentar extrair informações do erro
      if (error.meta) {
        this.logger.error(`Metadados do erro: ${JSON.stringify(error.meta)}`);
      }
      
      // Esperar 5 segundos e tentar reconectar
      this.logger.log('Tentando reconectar em 5 segundos...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      try {
        await this.$connect();
        this.logger.log('Reconexão bem-sucedida!');
      } catch (retryError) {
        this.logger.error(`Falha na tentativa de reconexão: ${retryError.message}`);
        process.exit(1);
      }
    }
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      this.logger.log('Desconectando Prisma antes de encerrar...');
      await this.$disconnect();
      await app.close();
    });
    
    process.on('SIGINT', async () => {
      this.logger.log('Recebido SIGINT, encerrando aplicação graciosamente...');
      await this.$disconnect();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      this.logger.log('Recebido SIGTERM, encerrando aplicação graciosamente...');
      await this.$disconnect();
      process.exit(0);
    });
  }
}
