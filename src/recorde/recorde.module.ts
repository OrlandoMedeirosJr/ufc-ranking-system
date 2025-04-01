import { Module } from '@nestjs/common';
import { RecordeService } from './recorde.service';
import { RecordeController } from './recorde.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [RecordeController],
  providers: [RecordeService, PrismaService],
  exports: [RecordeService],
})
export class RecordeModule {}
