import { Injectable, OnModuleInit, INestApplication, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);
  
  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });
  }
  
  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Prisma conectado com sucesso');
    } catch (error) {
      this.logger.error(`Erro ao conectar ao banco de dados: ${error.message}`, error.stack);
      // Tentar reconectar após 5 segundos
      setTimeout(() => this.onModuleInit(), 5000);
    }
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      this.logger.log('Desconectando Prisma antes de encerrar...');
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
