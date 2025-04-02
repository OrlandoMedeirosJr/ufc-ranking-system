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
    this.logger.log('Inicializando conexão com o Prisma...');
    try {
      this.logger.log(`Tentando conectar ao banco de dados com URL: ${this.getDatabaseUrl()}`);
      await this.$connect();
      this.logger.log('Conexão com o banco de dados estabelecida com sucesso via Prisma');
    } catch (error) {
      this.logger.error(`Erro ao conectar ao banco de dados via Prisma: ${error.message}`, error.stack);
      throw error;
    }
  }

  async enableShutdownHooks(app: INestApplication) {
    this.logger.log('Configurando hooks de desligamento...');
    try {
      process.on('beforeExit', async () => {
        this.logger.log('Prisma está encerrando a conexão...');
        await app.close();
        this.logger.log('Aplicação fechada com sucesso');
      });
      this.logger.log('Hooks de desligamento configurados com sucesso');
    } catch (error) {
      this.logger.error(`Erro ao configurar hooks de desligamento: ${error.message}`, error.stack);
    }
  }

  // Método helper para verificar a URL do banco de dados (ocultando credenciais)
  private getDatabaseUrl(): string {
    const url = process.env.DATABASE_URL || '';
    if (!url) return 'URL do banco de dados não definida';
    
    try {
      const parsedUrl = new URL(url);
      return `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}`;
    } catch {
      return 'URL do banco de dados inválida';
    }
  }
}
