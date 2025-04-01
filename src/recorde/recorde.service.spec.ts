import { Test, TestingModule } from '@nestjs/testing';
import { RecordeService } from './recorde.service';

describe('RecordeService', () => {
  let service: RecordeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecordeService],
    }).compile();

    service = module.get<RecordeService>(RecordeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
