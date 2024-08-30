import { Test, TestingModule } from '@nestjs/testing';
import { ContaReceberBaixaService } from './conta-receber-baixa.service';

describe('ContaReceberBaixaService', () => {
  let service: ContaReceberBaixaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContaReceberBaixaService],
    }).compile();

    service = module.get<ContaReceberBaixaService>(ContaReceberBaixaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
