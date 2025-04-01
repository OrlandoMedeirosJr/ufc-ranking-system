import {
  Body,
  Controller,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventoService } from './evento.service';

@Controller('eventos')
export class EventoController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventoService: EventoService,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async criarEvento(@Body() data: any) {
    const evento = await this.prisma.evento.create({ data });
    return { mensagem: 'Evento criado com sucesso', evento };
  }

  @Post(':id/finalizar')
  async finalizarEvento(@Param('id') id: string) {
    return this.eventoService.finalizarEvento(Number(id));
  }
}
