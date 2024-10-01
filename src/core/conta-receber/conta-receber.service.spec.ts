import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EMensagem } from '../../shared/enums/mensagem.enum';
import { ContaReceberService } from './conta-receber.service';
import { ContaReceber } from './entities/conta-receber.entity';
import { ExportPdfService } from '../../shared/services/export-pdf.service';
import { IGrpcUsuarioService } from '../../shared/interfaces/grpc-usuario.service';

describe('ContaReceberService', () => {
  let service: ContaReceberService;
  let repository: Repository<ContaReceber>;
  let exportPdfService: ExportPdfService;
  let grpcUsuarioService: IGrpcUsuarioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContaReceberService,
        {
          provide: getRepositoryToken(ContaReceber),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            find: jest.fn(),
            delete: jest.fn()
          },
        },
        {
          provide: 'GRPC_USUARIO',
          useValue: {
            getService: jest.fn(),
            FindOne: jest.fn()
          },
        },
        {
          provide: 'MAIL_SERVICE',
          useValue: {
            emit: jest.fn(),
            get: jest.fn()
          }
        },
        {
          provide: ExportPdfService,
          useValue: {
            export: jest.fn()
          }
        }
      ],
    }).compile();

    service = module.get<ContaReceberService>(ContaReceberService);
    repository = module.get<Repository<ContaReceber>>(getRepositoryToken(ContaReceber));
    exportPdfService = module.get<ExportPdfService>(ExportPdfService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

      const spyRepositorySave = jest
        .spyOn(repository, 'save')
        .mockReturnValue(Promise.resolve(mockContaReceber));

      const response = await service.create(createContaReceberDto);

      expect(response).toEqual(mockContaReceber);
      expect(spyRepositorySave).toHaveBeenCalled();
    });

  });

  describe('delete', () => {
    it('excluir uma conta a receber', async () => {

      const mockDeleteRepositoryResponse = { raw: 'Objeto excluído', affect: 1 }

      const spyRepositoryDelete = jest
        .spyOn(repository, 'delete')
        .mockReturnValue(Promise.resolve(mockDeleteRepositoryResponse));

      const response = await service.delete(1);

      expect(response).toEqual(false);
      expect(spyRepositoryDelete).toHaveBeenCalled();
    });

  });

  describe('findAll', () => {

    const mockListaContaReceber = [
      {
        id: 1,
        idPessoa: 1,
        pessoa: 'Matheus Garcia',
        idUsuarioLancamento: 1,
        valorTotal: 10.00,
        pago: false,
        dataHora: new Date()
      },
    ];

    const mockOrderFilter = { column: 'id', sort: 'asc' as 'asc' };

    it('obter uma listagem contas a receber', async () => {

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findAndCount')
        .mockReturnValue(Promise.resolve([mockListaContaReceber, 1]));

      const response = await service.findAll(1, 10, mockOrderFilter, null);

      expect(response.data).toEqual(mockListaContaReceber);
      expect(response.message).toEqual('');
      expect(spyRepositoryFindOne).toHaveBeenCalled();
    });

    it('obter uma listagem contas a receber por id pessoa', async () => {

      const mockFilter = { column: 'idPessoa', value: 1 }

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findAndCount')
        .mockReturnValue(Promise.resolve([mockListaContaReceber, 1]));

      const response = await service.findAll(1, 10, mockOrderFilter, mockFilter);

      expect(response.data).toEqual(mockListaContaReceber);
      expect(response.message).toEqual('');
      expect(spyRepositoryFindOne).toHaveBeenCalled();
    });

    it('obter uma listagem contas a receber por nome de pessoa', async () => {

      const mockFilter = { column: 'pessoa', value: 'Matheus' }

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findAndCount')
        .mockReturnValue(Promise.resolve([mockListaContaReceber, 1]));

      const response = await service.findAll(1, 10, mockOrderFilter, mockFilter);

      expect(response.data).toEqual(mockListaContaReceber);
      expect(response.message).toEqual('');
      expect(spyRepositoryFindOne).toHaveBeenCalled();
    });

    it('obter uma listagem contas a receber por id', async () => {

      const mockFilter = { column: 'id', value: 1 }

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findAndCount')
        .mockReturnValue(Promise.resolve([mockListaContaReceber, 1]));

      const response = await service.findAll(1, 10, mockOrderFilter, mockFilter);

      expect(response.data).toEqual(mockListaContaReceber);
      expect(response.message).toEqual('');
      expect(spyRepositoryFindOne).toHaveBeenCalled();
    });

    it('obter uma listagem contas a receber pagas', async () => {

      const mockFilter = { column: 'pago', value: true }

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findAndCount')
        .mockReturnValue(Promise.resolve([mockListaContaReceber, 1]));

      const response = await service.findAll(1, 10, mockOrderFilter, mockFilter);

      expect(response.data).toEqual(mockListaContaReceber);
      expect(response.message).toEqual('');
      expect(spyRepositoryFindOne).toHaveBeenCalled();
    });

    it('obter uma listagem contas a receber pagas por periodo', async () => {

      const mockFilter = { column: 'dataHora', value: new Date().toString() }

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findAndCount')
        .mockReturnValue(Promise.resolve([mockListaContaReceber, 1]));

      const response = await service.findAll(1, 10, mockOrderFilter, mockFilter);

      expect(response.data).toEqual(mockListaContaReceber);
      expect(response.message).toEqual('');
      expect(spyRepositoryFindOne).toHaveBeenCalled();
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
        pago: false,
        dataHora: new Date()
      };

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockReturnValue(Promise.resolve(mockContaReceber));

      const response = await service.findOne(1);

      expect(response).toEqual(mockContaReceber);
      expect(spyRepositoryFindOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('alterar um usuário', async () => {
      const updateContaReceberDto = {
        id: 1,
        idPessoa: 1,
        pessoa: 'Matheus Garcia',
        idUsuarioLancamento: 1,
        valorTotal: 10.00,
        pago: false,
        dataHora: new Date()
      };

      const mockContaReceber = Object.assign(updateContaReceberDto, {});

      const spyRepositorySave = jest
        .spyOn(repository, 'save')
        .mockReturnValue(Promise.resolve(mockContaReceber));

      const response = await service.update(1, updateContaReceberDto);

      expect(response).toEqual(updateContaReceberDto);
      expect(spyRepositorySave).toHaveBeenCalled();
    });

    it('lançar erro ao enviar ids diferentes quando alterar um conta-receber', async () => {
      const updateContaReceberDto = {
        id: 1,
        idPessoa: 1,
        pessoa: 'Matheus Garcia',
        idUsuarioLancamento: 1,
        valorTotal: 10.00,
        pago: false,
        dataHora: new Date()
      };

      try {
        await service.update(2, updateContaReceberDto);
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(EMensagem.IDsDiferentes);
      }
    });

  });

});


