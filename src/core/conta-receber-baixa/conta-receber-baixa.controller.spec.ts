import { Test, TestingModule } from '@nestjs/testing';
import { ContaReceberBaixaController } from './conta-receber-baixa.controller';

describe('ContaReceberBaixaController', () => {
  let controller: ContaReceberBaixaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContaReceberBaixaController],
    }).compile();

    controller = module.get<ContaReceberBaixaController>(ContaReceberBaixaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
