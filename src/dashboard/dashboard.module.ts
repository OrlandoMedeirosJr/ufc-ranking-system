import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DashboardController],
  providers: [],
})
export class DashboardModule {} 