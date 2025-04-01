import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('lutas')
export class LutaController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async criarLuta(@Body() data: any) {
    const luta = await this.prisma.luta.create({ data });
    return { mensagem: 'Luta criada com sucesso', luta };
  }
}
