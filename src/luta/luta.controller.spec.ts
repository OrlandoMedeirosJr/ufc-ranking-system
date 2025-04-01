import { Test, TestingModule } from '@nestjs/testing';
import { LutaController } from './luta.controller';

describe('LutaController', () => {
  let controller: LutaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LutaController],
    }).compile();

    controller = module.get<LutaController>(LutaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
