import { Test, TestingModule } from '@nestjs/testing';
import { LutadorService } from './lutador.service';

describe('LutadorService', () => {
  let service: LutadorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LutadorService],
    }).compile();

    service = module.get<LutadorService>(LutadorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
