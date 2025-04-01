import { Test, TestingModule } from '@nestjs/testing';
import { LutaService } from './luta.service';

describe('LutaService', () => {
  let service: LutaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LutaService],
    }).compile();

    service = module.get<LutaService>(LutaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
