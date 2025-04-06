import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';

const execPromise = promisify(exec);

interface BackupData {
  lutadores: any[];
  eventos: any[];
  lutas: any[];
  metadata: {
    version: string;
    timestamp: string;
    description: string;
  };
}

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createBackup(): Promise<{ filename: string; message: string }> {
    try {
      // Garantir que o diretório de backups existe
      const backupDir = path.join(process.cwd(), 'backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
        this.logger.log(`Diretório de backups criado: ${backupDir}`);
      }

      // Gerar nome de arquivo com timestamp
      const timestamp = new Date().toISOString()
        .replace(/T/, '_')
        .replace(/\..+/, '')
        .replace(/:/g, '')
        .replace(/-/g, '');
      
      const filename = `backup_${timestamp}.sql`;
      const backupPath = path.join(backupDir, filename);

      // Executar comando pg_dump no container Docker
      const command = `docker exec ufc-postgres pg_dump -U postgres -d ufcdb > ${backupPath}`;
      this.logger.log(`Executando comando: ${command}`);
      
      await execPromise(command);
      
      this.logger.log(`Backup criado com sucesso: ${backupPath}`);
      return { 
        filename, 
        message: `Backup criado com sucesso: ${filename}` 
      };
    } catch (error) {
      this.logger.error(`Erro ao criar backup: ${error.message}`, error.stack);
      throw new Error(`Falha ao criar backup: ${error.message}`);
    }
  }

  async listBackups(): Promise<{ filename: string; size: string; date: string }[]> {
    try {
      const backupDir = path.join(process.cwd(), 'backups');
      if (!fs.existsSync(backupDir)) {
        return [];
      }

      const files = fs.readdirSync(backupDir);
      const backupFiles = files
        .filter(file => file.endsWith('.sql'))
        .map(file => {
          const filePath = path.join(backupDir, file);
          const stats = fs.statSync(filePath);
          const fileSize = (stats.size / (1024 * 1024)).toFixed(2); // em MB
          return {
            filename: file,
            size: `${fileSize} MB`,
            date: stats.mtime.toISOString()
          };
        })
        .sort((a, b) => b.date.localeCompare(a.date)); // Mais recentes primeiro

      return backupFiles;
    } catch (error) {
      this.logger.error(`Erro ao listar backups: ${error.message}`, error.stack);
      throw new Error(`Falha ao listar backups: ${error.message}`);
    }
  }

  async getBackupFilePath(filename: string): Promise<string> {
    try {
      // Validar filename para evitar path traversal
      if (!filename.match(/^backup_\d{8}_\d{6}\.sql$/)) {
        throw new Error('Nome de arquivo inválido');
      }

      const backupDir = path.join(process.cwd(), 'backups');
      const backupPath = path.join(backupDir, filename);

      if (!fs.existsSync(backupPath)) {
        throw new Error('Arquivo de backup não encontrado');
      }

      return backupPath;
    } catch (error) {
      this.logger.error(`Erro ao obter caminho do backup: ${error.message}`, error.stack);
      throw new Error(`Falha ao obter caminho do backup: ${error.message}`);
    }
  }

  async exportarDadosJSON(): Promise<BackupData> {
    try {
      this.logger.log('Iniciando exportação dos dados para JSON');
      
      // Buscar todos os dados necessários
      const lutadores = await this.prisma.lutador.findMany();
      const eventos = await this.prisma.evento.findMany({
        include: {
          lutas: true,
        },
      });
      const lutas = await this.prisma.luta.findMany({
        include: {
          lutador1: true,
          lutador2: true,
          vencedor: true,
          evento: true,
        },
      });

      // Criar objeto de backup com metadados
      const backupData: BackupData = {
        lutadores,
        eventos,
        lutas,
        metadata: {
          version: '1.0',
          timestamp: new Date().toISOString(),
          description: 'Backup completo do UFC Ranking System',
        },
      };

      this.logger.log(`Exportação JSON concluída: ${lutadores.length} lutadores, ${eventos.length} eventos, ${lutas.length} lutas`);
      
      return backupData;
    } catch (error) {
      this.logger.error(`Erro ao exportar dados para JSON: ${error.message}`, error.stack);
      throw new Error(`Falha ao exportar dados: ${error.message}`);
    }
  }

  async salvarBackupJSON(dados: BackupData): Promise<string> {
    try {
      // Garantir que o diretório de backups existe
      const backupDir = path.join(process.cwd(), 'backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
        this.logger.log(`Diretório de backups criado: ${backupDir}`);
      }

      // Gerar nome de arquivo com timestamp
      const timestamp = new Date().toISOString()
        .replace(/T/, '_')
        .replace(/\..+/, '')
        .replace(/:/g, '')
        .replace(/-/g, '');
      
      const filename = `backup-ufc-${timestamp}.json`;
      const backupPath = path.join(backupDir, filename);

      // Salvar o arquivo JSON
      fs.writeFileSync(backupPath, JSON.stringify(dados, null, 2));
      
      this.logger.log(`Backup JSON criado com sucesso: ${backupPath}`);
      return filename;
    } catch (error) {
      this.logger.error(`Erro ao salvar backup JSON: ${error.message}`, error.stack);
      throw new Error(`Falha ao salvar backup JSON: ${error.message}`);
    }
  }

  async importarDadosJSON(dados: BackupData): Promise<void> {
    this.logger.log('Iniciando importação dos dados do JSON');
    
    try {
      // Verificar se os dados são válidos
      if (!dados || !dados.lutadores || !dados.eventos || !dados.lutas || !dados.metadata) {
        throw new Error('Formato de arquivo de backup inválido');
      }

      // Iniciar transação para garantir atomicidade
      await this.prisma.$transaction(async (tx) => {
        // Limpar o banco de dados
        this.logger.log('Limpando banco de dados atual');
        await tx.luta.deleteMany({});
        await tx.evento.deleteMany({});
        await tx.lutador.deleteMany({});
        
        // Importar lutadores
        this.logger.log(`Importando ${dados.lutadores.length} lutadores`);
        for (const lutador of dados.lutadores) {
          // Remover campos que podem causar conflitos
          const { id, createdAt, updatedAt, ...lutadorData } = lutador;
          
          await tx.lutador.create({
            data: {
              id: id, // Manter o mesmo ID para preservar referências
              ...lutadorData,
            },
          });
        }
        
        // Importar eventos
        this.logger.log(`Importando ${dados.eventos.length} eventos`);
        for (const evento of dados.eventos) {
          // Remover campos que podem causar conflitos
          const { id, createdAt, updatedAt, lutas, ...eventoData } = evento;
          
          await tx.evento.create({
            data: {
              id: id, // Manter o mesmo ID para preservar referências
              ...eventoData,
            },
          });
        }
        
        // Importar lutas
        this.logger.log(`Importando ${dados.lutas.length} lutas`);
        for (const luta of dados.lutas) {
          // Remover campos que podem causar conflitos
          const { id, createdAt, updatedAt, lutador1, lutador2, vencedor, evento, ...lutaData } = luta;
          
          await tx.luta.create({
            data: {
              id: id, // Manter o mesmo ID para preservar referências
              ...lutaData,
            },
          });
        }
      });
      
      this.logger.log('Importação dos dados concluída com sucesso');
    } catch (error) {
      this.logger.error(`Erro ao importar dados: ${error.message}`, error.stack);
      throw new Error(`Falha ao importar dados: ${error.message}`);
    }
  }

  async validarBackupJSON(filepath: string): Promise<BackupData> {
    try {
      this.logger.log(`Validando arquivo de backup: ${filepath}`);
      
      if (!fs.existsSync(filepath)) {
        throw new Error('Arquivo não encontrado');
      }
      
      const conteudo = fs.readFileSync(filepath, 'utf8');
      let dados: BackupData;
      
      try {
        dados = JSON.parse(conteudo);
      } catch (error) {
        throw new Error('Arquivo JSON inválido');
      }
      
      // Validar estrutura
      if (!dados || !dados.lutadores || !dados.eventos || !dados.lutas || !dados.metadata) {
        throw new Error('Estrutura do arquivo de backup inválida');
      }
      
      this.logger.log('Arquivo de backup validado com sucesso');
      return dados;
    } catch (error) {
      this.logger.error(`Erro ao validar backup: ${error.message}`, error.stack);
      throw new Error(`Falha ao validar backup: ${error.message}`);
    }
  }
} 