import { Controller, Get } from '@nestjs/common';
import { RecordeService } from './recorde.service';

@Controller('recordes')
export class RecordeController {
  constructor(private readonly recordeService: RecordeService) {}

  @Get()
  async listarRecordes() {
    return this.recordeService.listarRecordes();
  }
}
