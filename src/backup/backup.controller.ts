import { Controller, Get, Post, Param, Res, Logger, HttpException, HttpStatus, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
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

  @Get('exportar')
  async exportarDados(@Res() res: Response) {
    try {
      this.logger.log('Iniciando exportação de dados em JSON');
      
      // Exportar os dados
      const dados = await this.backupService.exportarDadosJSON();
      
      // Salvar o arquivo
      const filename = await this.backupService.salvarBackupJSON(dados);
      
      // Preparar para download
      const backupDir = path.join(process.cwd(), 'backups');
      const filePath = path.join(backupDir, filename);
      
      // Verificar se o arquivo existe
      if (!fs.existsSync(filePath)) {
        throw new HttpException('Arquivo não foi gerado corretamente', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // Configurar headers para download
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.setHeader('Content-Type', 'application/json');
      
      // Enviar o arquivo como stream
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      
      this.logger.log(`Download do backup JSON iniciado: ${filename}`);
    } catch (error) {
      this.logger.error(`Erro ao exportar dados: ${error.message}`, error.stack);
      throw new HttpException(
        `Erro ao exportar dados: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('importar')
  @UseInterceptors(
    FileInterceptor('arquivo', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `backup-${uniqueSuffix}${path.extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Aceitar apenas arquivos JSON
        if (file.mimetype !== 'application/json' && !file.originalname.endsWith('.json')) {
          return cb(new HttpException('Apenas arquivos JSON são permitidos', HttpStatus.BAD_REQUEST), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // Limite de 10MB
      },
    }),
  )
  async importarDados(@UploadedFile() file: any) {
    try {
      if (!file) {
        throw new HttpException('Nenhum arquivo foi enviado', HttpStatus.BAD_REQUEST);
      }
      
      this.logger.log(`Arquivo recebido: ${file.originalname}, tamanho: ${file.size} bytes`);
      
      // Criar diretório de uploads se não existir
      const uploadsDir = './uploads';
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Validar o arquivo
      const dados = await this.backupService.validarBackupJSON(file.path);
      
      // Importar os dados
      await this.backupService.importarDadosJSON(dados);
      
      // Remover o arquivo após o processamento
      fs.unlinkSync(file.path);
      
      return {
        success: true,
        message: 'Dados importados com sucesso',
        detalhes: {
          lutadores: dados.lutadores.length,
          eventos: dados.eventos.length,
          lutas: dados.lutas.length,
          timestamp: dados.metadata.timestamp,
        },
      };
    } catch (error) {
      // Remover o arquivo em caso de erro, se existir
      if (file && file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      
      this.logger.error(`Erro ao importar dados: ${error.message}`, error.stack);
      throw new HttpException(
        `Erro ao importar dados: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 