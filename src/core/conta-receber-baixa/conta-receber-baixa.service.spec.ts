import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EMensagem } from '../../shared/enums/mensagem.enum';
import { ExportPdfService } from '../../shared/services/export-pdf.service';
import { ContaReceberBaixaService } from './conta-receber-baixa.service';
import { ContaReceberBaixa } from './entities/conta-receber-baixa.entity';
import { ContaReceber } from '../conta-receber/entities/conta-receber.entity';

describe('ContaReceberService', () => {
  let service: ContaReceberBaixaService;
  let repository: Repository<ContaReceberBaixa>;
  let repositoryContaReceber: Repository<ContaReceber>;
  let exportPdfService: ExportPdfService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContaReceberBaixaService,
        {
          provide: getRepositoryToken(ContaReceberBaixa),
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
          provide: getRepositoryToken(ContaReceber),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
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

    service = module.get<ContaReceberBaixaService>(ContaReceberBaixaService);
    repository = module.get<Repository<ContaReceberBaixa>>(getRepositoryToken(ContaReceberBaixa));
    repositoryContaReceber = module.get<Repository<ContaReceber>>(getRepositoryToken(ContaReceber));
    exportPdfService = module.get<ExportPdfService>(ExportPdfService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('criar uma nova baixa de conta a receber', async () => {
      const createContaReceberBaixaDto = {
        idContaReceber: 1,
        idUsuarioBaixa: 1,
        valorPago: 10.00
      };

      const mockContaReceberBaixa = {
        id: 1,
        idContaReceber: 1,
        idUsuarioBaixa: 1,
        valorPago: 10.00,
        dataHora: new Date(),
        contaReceber: undefined,
      };

      const mockContaReceber = {
        id: 1,
        idPessoa: 1,
        pessoa: 'Matheus Garcia',
        idUsuarioLancamento: 1,
        valorTotal: 10.00,
        pago: false,
        dataHora: new Date()
      };

      const spyRepositoryContaReceberFindOne = jest
      .spyOn(repositoryContaReceber, 'findOne')
      .mockReturnValue(Promise.resolve(mockContaReceber));

      const spyRepositoryFind = jest
        .spyOn(repository, 'find')
        .mockReturnValue(Promise.resolve([mockContaReceberBaixa]));

      const spyRepositorySave = jest
        .spyOn(repository, 'save')
        .mockReturnValue(Promise.resolve(mockContaReceberBaixa));

      const response = await service.create(createContaReceberBaixaDto);

      expect(response).toEqual(mockContaReceberBaixa);
      expect(spyRepositorySave).toHaveBeenCalled();
      expect(spyRepositoryContaReceberFindOne).toHaveBeenCalled();
      expect(spyRepositoryFind).toHaveBeenCalled();
    });

  });

  describe('delete', () => {
    it('excluir uma baixa de conta a receber', async () => {

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

    it('obter uma listagem de baixas de contas a receber', async () => {

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findAndCount')
        .mockReturnValue(Promise.resolve([mockListaContaReceberBaixa, 1]));

      const response = await service.findAll(1, 10, mockOrderFilter, null);

      expect(response.data).toEqual(mockListaContaReceberBaixa);
      expect(response.message).toEqual('');
      expect(spyRepositoryFindOne).toHaveBeenCalled();
    });

    it('obter uma listagem de baixas de contas a receber por id de usuário de baixa', async () => {

      const mockFilter = { column: 'idUsuarioBaixa', value: 1 }

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findAndCount')
        .mockReturnValue(Promise.resolve([mockListaContaReceberBaixa, 1]));

      const response = await service.findAll(1, 10, mockOrderFilter, mockFilter);

      expect(response.data).toEqual(mockListaContaReceberBaixa);
      expect(response.message).toEqual('');
      expect(spyRepositoryFindOne).toHaveBeenCalled();
    });

    it('obter uma listagem de baixas de contas a receber por id', async () => {

      const mockFilter = { column: 'id', value: 1 }

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findAndCount')
        .mockReturnValue(Promise.resolve([mockListaContaReceberBaixa, 1]));

      const response = await service.findAll(1, 10, mockOrderFilter, mockFilter);

      expect(response.data).toEqual(mockListaContaReceberBaixa);
      expect(response.message).toEqual('');
      expect(spyRepositoryFindOne).toHaveBeenCalled();
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

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockReturnValue(Promise.resolve(mockContaReceberBaixa));

      const response = await service.findOne(1);

      expect(response).toEqual(mockContaReceberBaixa);
      expect(spyRepositoryFindOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('alterar uma baixa de conta a receber', async () => {
      const updateContaReceberBaixaDto = {
        id: 1,
        idContaReceber: 1,
        idUsuarioBaixa: 1,
        valorPago: 10.00,
        dataHora: new Date(),
        contaReceber: undefined,
      };

      const mockContaReceber = {
        id: 1,
        idPessoa: 1,
        pessoa: 'Matheus Garcia',
        idUsuarioLancamento: 1,
        valorTotal: 10.00,
        pago: false,
        dataHora: new Date()
      };

      const spyRepositorySave = jest
        .spyOn(repository, 'save')
        .mockReturnValue(Promise.resolve(updateContaReceberBaixaDto));

        const spyRepositoryContaReceberFindOne = jest
        .spyOn(repositoryContaReceber, 'findOne')
        .mockReturnValue(Promise.resolve(mockContaReceber));
  
        const spyRepositoryFind = jest
          .spyOn(repository, 'find')
          .mockReturnValue(Promise.resolve([updateContaReceberBaixaDto]));

      const response = await service.update(1, updateContaReceberBaixaDto);

      expect(response).toEqual(updateContaReceberBaixaDto);
      expect(spyRepositorySave).toHaveBeenCalled();
      expect(spyRepositoryContaReceberFindOne).toHaveBeenCalled();
      expect(spyRepositoryFind).toHaveBeenCalled();
    });

    it('lançar erro ao enviar ids diferentes quando alterar uma baixa de conta-receber', async () => {
      const updateContaReceberBaixaDto = {
        id: 1,
        idContaReceber: 1,
        idUsuarioBaixa: 1,
        valorPago: 10.00,
        dataHora: new Date(),
        contaReceber: undefined,
      };

      try {
        await service.update(2, updateContaReceberBaixaDto);
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(EMensagem.IDsDiferentes);
      }
    });

  });
});


