import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execPromise = promisify(exec);

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

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
      if (!filename.match(/^backup_\d+\.sql$/)) {
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
} 