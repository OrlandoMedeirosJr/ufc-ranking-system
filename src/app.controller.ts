import { Controller, Get, Param, Query, Res, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { Response } from 'express';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('system-info')
  getSystemInfo(): object {
    return {
      version: '1.0.0',
      status: 'online',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('lutadores-list')
  async getLutadores() {
    this.logger.log('Chamando endpoint lutadores-list');
    try {
      const lutadores = await this.prisma.lutador.findMany({
        orderBy: { nome: 'asc' },
      });
      this.logger.log(`Retornando ${lutadores.length} lutadores`);
      return lutadores;
    } catch (error) {
      this.logger.error(`Erro ao listar lutadores: ${error.message}`, error.stack);
      return { error: 'Erro ao listar lutadores', message: error.message };
    }
  }

  @Get('all-endpoints')
  getAllEndpoints(@Res() res: Response) {
    const routes = [
      { path: '/', method: 'GET', description: 'Página inicial' },
      {
        path: '/system-info',
        method: 'GET',
        description: 'Informações do sistema',
      },
      {
        path: '/ranking/:categoria',
        method: 'GET',
        description: 'Obter ranking por categoria',
      },
      {
        path: '/lutadores-list',
        method: 'GET',
        description: 'Listar todos os lutadores',
      },
      {
        path: '/lutadores',
        method: 'GET',
        description: 'Listar todos os lutadores (endpoint oficial)',
      },
    ];

    return res.json(routes);
  }

  @Get('health')
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString()
    };
  }

  @Get('health-db')
  async healthCheck() {
    // Verifica se o banco de dados está acessível
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
        uptime: process.uptime()
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error.message,
        uptime: process.uptime()
      };
    }
  }
}
