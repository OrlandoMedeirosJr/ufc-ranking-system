import { Module } from '@nestjs/common';
import { BackupController } from './backup.controller';
import { BackupService } from './backup.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [BackupController],
  providers: [BackupService],
  exports: [BackupService],
})
export class BackupModule {} 