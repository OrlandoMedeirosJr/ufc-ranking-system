import { Controller, Get, Param, Res, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import { BackupService } from './backup.service';

@Controller('backup')
export class BackupController {
  private readonly logger = new Logger(BackupController.name);

  constructor(private readonly backupService: BackupService) {}

  @Get()
  async createBackup() {
    try {
      this.logger.log('Iniciando processo de backup do banco de dados');
      const result = await this.backupService.createBackup();
      this.logger.log(`Backup concluído: ${result.filename}`);
      return result;
    } catch (error) {
      this.logger.error(`Erro ao fazer backup: ${error.message}`, error.stack);
      throw new HttpException(
        `Erro ao fazer backup: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('list')
  async listBackups() {
    try {
      this.logger.log('Listando backups disponíveis');
      const backups = await this.backupService.listBackups();
      return { backups };
    } catch (error) {
      this.logger.error(`Erro ao listar backups: ${error.message}`, error.stack);
      throw new HttpException(
        `Erro ao listar backups: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('download/:filename')
  async downloadBackup(@Param('filename') filename: string, @Res() res: Response) {
    try {
      this.logger.log(`Solicitação de download do backup: ${filename}`);
      const filePath = await this.backupService.getBackupFilePath(filename);
      
      // Verificar se o arquivo existe
      if (!fs.existsSync(filePath)) {
        throw new HttpException('Arquivo não encontrado', HttpStatus.NOT_FOUND);
      }

      // Configurar headers para download
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.setHeader('Content-Type', 'application/sql');
      
      // Enviar o arquivo como stream
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      
      this.logger.log(`Download do backup iniciado: ${filename}`);
    } catch (error) {
      this.logger.error(`Erro ao fazer download do backup: ${error.message}`, error.stack);
      throw new HttpException(
        `Erro ao fazer download do backup: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 