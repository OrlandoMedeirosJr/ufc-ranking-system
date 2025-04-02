import { Module } from '@nestjs/common';
import { RecordeService } from './recorde.service';
import { RecordeController } from './recorde.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RecordeController],
  providers: [RecordeService],
  exports: [RecordeService],
})
export class RecordeModule {}
