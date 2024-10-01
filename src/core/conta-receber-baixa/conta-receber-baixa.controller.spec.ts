import { Test, TestingModule } from '@nestjs/testing';
import { EMensagem } from '../../shared/enums/mensagem.enum';
import { ContaReceberBaixaController } from './conta-receber-baixa.controller';
import { ContaReceberBaixaService } from './conta-receber-baixa.service';

describe('ContaReceberController', () => {
  let controller: ContaReceberBaixaController;
  let service: ContaReceberBaixaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContaReceberBaixaController],
      providers: [
        {
          provide: ContaReceberBaixaService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            exportPdf: jest.fn(),
            delete: jest.fn()
          },
        },
      ],
    }).compile();

    controller = module.get<ContaReceberBaixaController>(ContaReceberBaixaController);
    service = module.get<ContaReceberBaixaService>(ContaReceberBaixaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('criar uma nova baixa de conta a receber', async () => {
      const createContaReceberBaixaDto = {
        idContaReceber: 1,
        idUsuarioBaixa: 1,
        valorPago: 10.00,
        contaReceber: undefined,
      };

      const mockContaReceberBaixa = Object.assign(createContaReceberBaixaDto, { id: 1, dataHora: new Date() });

      const spyServiceCreate = jest
        .spyOn(service, 'create')
        .mockReturnValue(Promise.resolve(mockContaReceberBaixa));

      const response = await controller.create(createContaReceberBaixaDto);

      expect(response.message).toEqual(EMensagem.SalvoSucesso);
      expect(response.data).toEqual(mockContaReceberBaixa);
      expect(spyServiceCreate).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('exclui uma baixa de conta a receber', async () => {

      const spyServiceDelete = jest
        .spyOn(service, 'delete')
        .mockReturnValue(Promise.resolve(false));

      const response = await controller.delete(1);

      expect(response.message).toEqual(EMensagem.DesativadoSucesso);
      expect(response.data).toEqual(false);
      expect(spyServiceDelete).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('obter uma listagem contas a receber', async () => {
      const mockListaContaReceberBaixa = [
        {
          id: 1,
          idContaReceber: 1,
          idUsuarioBaixa: 1,
          valorPago: 10.00,
          dataHora: new Date(),
          contaReceber: undefined,
        },
      ];

      const mockOrderFilter = { column: 'id', sort: 'asc' as 'asc' };

      const mockFilter = { column: '', value: '' }

      const spyServiceFindAll = jest
        .spyOn(service, 'findAll')
        .mockReturnValue(Promise.resolve({message: undefined, count: 1, data:mockListaContaReceberBaixa}));

      const response = await controller.findAll(1, 10, mockOrderFilter, mockFilter);

      expect(response.message).toEqual(null);
      expect(response.data).toEqual(mockListaContaReceberBaixa);
      expect(spyServiceFindAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('obter uma conta a receber', async () => {
      const mockContaReceberBaixa = {
        id: 1,
        idContaReceber: 1,
        idUsuarioBaixa: 1,
        valorPago: 10.00,
        dataHora: new Date(),
        contaReceber: undefined,
      };

      const spyServiceFindOne = jest
        .spyOn(service, 'findOne')
        .mockReturnValue(Promise.resolve(mockContaReceberBaixa));

      const response = await controller.findOne(1);

      expect(response.message).toEqual(undefined);
      expect(response.data).toEqual(mockContaReceberBaixa);
      expect(spyServiceFindOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('alterar um usuário', async () => {
      const mockContaReceberBaixa = {
        id: 1,
        idContaReceber: 1,
        idUsuarioBaixa: 1,
        valorPago: 10.00,
        dataHora: new Date(),
        contaReceber: undefined,
      };

      const spyServiceUpdate = jest
        .spyOn(service, 'update')
        .mockReturnValue(Promise.resolve(mockContaReceberBaixa));

      const response = await controller.update(1, mockContaReceberBaixa);

      expect(response.message).toEqual(EMensagem.AtualizadoSucesso);
      expect(response.data).toEqual(mockContaReceberBaixa);
      expect(spyServiceUpdate).toHaveBeenCalled();
    });
  });

  describe('exportPdf', () => {
    it('gerar uma rquivo PDF', async () => {

      const mockOrderFilter = { column: 'id', sort: 'asc' as 'asc' };

      const mockFilter = { column: '', value: '' }

      const spyServiceExportPdf = jest
        .spyOn(service, 'exportPdf')
        .mockReturnValue(Promise.resolve(true));

      const response = await controller.exportPdf(1, mockOrderFilter, mockFilter);

      expect(response.message).toEqual(EMensagem.IniciadaGeracaoPDF);
      expect(response.data).toEqual(true);
      expect(spyServiceExportPdf).toHaveBeenCalled();
      expect(spyServiceExportPdf).toHaveBeenCalledWith(1, mockOrderFilter, mockFilter)
    });
  });

});
