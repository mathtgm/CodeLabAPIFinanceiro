import { Test, TestingModule } from '@nestjs/testing';
import { EMensagem } from '../../shared/enums/mensagem.enum';
import { ContaReceberController } from './conta-receber.controller';
import { ContaReceberService } from './conta-receber.service';

describe('ContaReceberController', () => {
  let controller: ContaReceberController;
  let service: ContaReceberService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContaReceberController],
      providers: [
        {
          provide: ContaReceberService,
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

    controller = module.get<ContaReceberController>(ContaReceberController);
    service = module.get<ContaReceberService>(ContaReceberService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('criar uma nova conta a receber', async () => {
      const createContaReceberDto = {
        idPessoa: 1,
        pessoa: 'Matheus Garcia',
        idUsuarioLancamento: 1,
        valorTotal: 10.00,
        pago: false
      };

      const mockContaReceber = Object.assign(createContaReceberDto, { id: 1, dataHora: new Date() });

      const spyServiceCreate = jest
        .spyOn(service, 'create')
        .mockReturnValue(Promise.resolve(mockContaReceber));

      const response = await controller.create(createContaReceberDto);

      expect(response.message).toEqual(EMensagem.SalvoSucesso);
      expect(response.data).toEqual(mockContaReceber);
      expect(spyServiceCreate).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('exclui uma conta a receber', async () => {

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
      const mockListaContaReceber = [
        {
          id: 1,
          idPessoa: 1,
          pessoa: 'Matheus Garcia',
          idUsuarioLancamento: 1,
          valorTotal: 10.00,
          dataHora: new Date(),
          pago: false
        },
      ];

      const mockOrderFilter = { column: 'id', sort: 'asc' as 'asc' };

      const mockFilter = { column: '', value: '' }

      const spyServiceFindAll = jest
        .spyOn(service, 'findAll')
        .mockReturnValue(Promise.resolve({message: undefined, count: 1, data:mockListaContaReceber}));

      const response = await controller.findAll(1, 10, mockOrderFilter, mockFilter);

      expect(response.message).toEqual(null);
      expect(response.data).toEqual(mockListaContaReceber);
      expect(spyServiceFindAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('obter uma conta a receber', async () => {
      const mockContaReceber = {
        id: 1,
        idPessoa: 1,
        pessoa: 'Matheus Garcia',
        idUsuarioLancamento: 1,
        valorTotal: 10.00,
        dataHora: new Date(),
        pago: false
      };
      const spyServiceFindOne = jest
        .spyOn(service, 'findOne')
        .mockReturnValue(Promise.resolve(mockContaReceber));

      const response = await controller.findOne(1);

      expect(response.message).toEqual(undefined);
      expect(response.data).toEqual(mockContaReceber);
      expect(spyServiceFindOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('alterar um usuário', async () => {
      const mockContaReceber ={
        id: 1,
        idPessoa: 1,
        pessoa: 'Matheus Garcia',
        idUsuarioLancamento: 1,
        valorTotal: 10.00,
        dataHora: new Date(),
        pago: false
      };

      const spyServiceUpdate = jest
        .spyOn(service, 'update')
        .mockReturnValue(Promise.resolve(mockContaReceber));

      const response = await controller.update(1, mockContaReceber);

      expect(response.message).toEqual(EMensagem.AtualizadoSucesso);
      expect(response.data).toEqual(mockContaReceber);
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
