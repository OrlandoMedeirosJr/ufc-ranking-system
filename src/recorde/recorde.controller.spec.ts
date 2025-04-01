import { Test, TestingModule } from '@nestjs/testing';
import { RecordeController } from './recorde.controller';

describe('RecordeController', () => {
  let controller: RecordeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecordeController],
    }).compile();

    controller = module.get<RecordeController>(RecordeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
