import { fakerPT_BR as faker } from '@faker-js/faker';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { EMensagem } from '../src/shared/enums/mensagem.enum';
import { ResponseExceptionsFilter } from '../src/shared/filters/response-exception.filter';
import { ResponseTransformInterceptor } from '../src/shared/interceptors/response-transform.interceptor';
import { ContaReceberBaixa } from '../src/core/conta-receber-baixa/entities/conta-receber-baixa.entity';
import { ContaReceber } from '../src/core/conta-receber/entities/conta-receber.entity';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let contaReceberBaixaBanco;
  let repository: Repository<ContaReceberBaixa>;
  let repositoryContaReceber: Repository<ContaReceber>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    app.useGlobalInterceptors(new ResponseTransformInterceptor());
    app.useGlobalFilters(new ResponseExceptionsFilter());

    await app.startAllMicroservices();
    await app.init();

    repository = app.get<Repository<ContaReceberBaixa>>(getRepositoryToken(ContaReceberBaixa));
    repositoryContaReceber = app.get<Repository<ContaReceber>>(getRepositoryToken(ContaReceber));
  });

  afterAll(async () => {
    await repository.delete({});
    await repositoryContaReceber.delete({});
    await app.close();
  });

  describe('CRUD /', () => {
    let idContaReceberBaixa: number;
    let idContaReceber: number;

    let contaReceberBaixa = {
      idUsuarioBaixa: faker.number.int({min: 1, max: 50}),
      valorPago: faker.finance.amount({ dec: 3 }),
      idContaReceber
    };

    const contaReceber = {
      idPessoa: faker.number.int({ min: 1, max: 50 }),
      pessoa: faker.person.fullName(),
      idUsuarioLancamento: faker.number.int({ min: 1, max: 50 }),
      valorTotal: faker.finance.amount({ dec: 3 }),
      pago: faker.datatype.boolean()
    };

    it('criar uma nova baixa de conta a receber', async () => {
      const respContaReceber = await request(app.getHttpServer())
        .post('/conta-receber')
        .send(contaReceber);

      contaReceberBaixa.idContaReceber = respContaReceber.body.data.id;

      const resp = await request(app.getHttpServer())
        .post('/conta-receber/baixa')
        .send(contaReceberBaixa);

      expect(resp).toBeDefined();
      expect(resp.body.message).toBe(EMensagem.SalvoSucesso);
      expect(resp.body.data).toHaveProperty('id');

      idContaReceberBaixa = resp.body.data.id;
    });

    it('carregar a baixa de conta receber criada', async () => {
      const resp = await request(app.getHttpServer()).get(`/conta-receber/baixa/${+idContaReceberBaixa}`);

      expect(resp).toBeDefined();
      expect(resp.body.message).toBe(null);
      expect(resp.body.data.idUsuarioBaixa).toBe(contaReceberBaixa.idUsuarioBaixa);
      expect(resp.body.data.idContaReceber).toBe(contaReceberBaixa.idContaReceber);
      expect(resp.body.data.valorPago).toBe(contaReceberBaixa.valorPago);
    });

    it('altera a baixa de conta receber criada', async () => {
      const financeiroAlterado = Object.assign(
        { id: idContaReceberBaixa, valorPago: faker.finance.amount({ dec: 3 }) },
        contaReceberBaixa,
        {},
      );

      const resp = await request(app.getHttpServer())
        .patch(`/conta-receber/baixa/${+idContaReceberBaixa}`)
        .send(financeiroAlterado);

      expect(resp).toBeDefined();
      expect(resp.body.message).toBe(EMensagem.AtualizadoSucesso);
      expect(resp.body.data).toHaveProperty('id');
      expect(resp.body.data.idUsuarioBaixa).toBe(contaReceberBaixa.idUsuarioBaixa);
      expect(resp.body.data.valorPago).toBe(contaReceberBaixa.valorPago);
      expect(resp.body.data.idContaReceber).toBe(contaReceberBaixa.idContaReceber);
    });

    it('tenta alterar a baixa de conta a receber criado passando um id diferente', async () => {
      const financeiroAlterado = Object.assign(contaReceber, {
        id: +idContaReceberBaixa,
        valorPago: faker.finance.amount({ dec: 3 })
      });

      const resp = await request(app.getHttpServer())
        .patch(`/conta-receber/baixa/999`)
        .send(financeiroAlterado);

      expect(resp.status).toBe(HttpStatus.NOT_ACCEPTABLE);
      expect(resp.body.message).toBe(EMensagem.IDsDiferentes);
      expect(resp.body.data).toBe(null);
    });

    it('excluir uma baixa de conta receber criada', async () => {
      const resp = await request(app.getHttpServer()).delete(`/conta-receber/baixa/${+idContaReceberBaixa}`);

      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.data).toBe(true);
    });
  });

  describe('PAGINAÇÃO (findAll) /', () => {
    const filter = { column: 'id', sort: 'asc' }

    it('obtem todos os registros da página 1', async () => {
      for (let i = 0; i < 10; i++) {

        
        const contaReceber = {
          idPessoa: faker.number.int({ min: 1, max: 50 }),
          pessoa: faker.person.fullName(),
          idUsuarioLancamento: faker.number.int({ min: 1, max: 50 }),
          valorTotal: faker.finance.amount({ dec: 3 }),
          pago: faker.datatype.boolean()
        };
        
        const respContaReceber = await request(app.getHttpServer())
        .post('/conta-receber')
        .send(contaReceber);

        let contaReceberBaixa = {
          idUsuarioBaixa: faker.number.int({min: 1, max: 50}),
          valorPago: faker.finance.amount({ dec: 3 }),
          idContaReceber: respContaReceber.body.data.id
        };
        
        const resp = await request(app.getHttpServer()).post('/conta-receber/baixa').send(contaReceberBaixa);
        contaReceberBaixaBanco = resp.body.data;
      }

      const resp = await request(app.getHttpServer()).get(`/conta-receber/baixa/0/5/${JSON.stringify(filter)}`);

      expect(resp).toBeDefined();
      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.message).toBe(null);
      expect(resp.body.data.length).toBe(5);
    });

    it('obtem todos os registros da página 2', async () => {
      const resp = await request(app.getHttpServer()).get(`/conta-receber/baixa/1/5/${JSON.stringify(filter)}`);

      expect(resp).toBeDefined();
      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.message).toBe(null);
      expect(resp.body.data.length).toBeGreaterThan(1);
    });

    it('obtem todas as baixas contas a receber pelo id', async () => {
      const resp = await request(app.getHttpServer()).get(`/conta-receber/baixa/0/5/${JSON.stringify(filter)}`).query({ filter: JSON.stringify({ column: 'id', value: contaReceberBaixaBanco.id }) });

      expect(resp).toBeDefined();
      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.message).toBe(null);
      expect(resp.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('obtem todas as baixas de contas a receber por periodo', async () => {
      const resp = await request(app.getHttpServer()).get(`/conta-receber/baixa/0/5/${JSON.stringify(filter)}`).query({ filter: JSON.stringify({ column: 'dataHora', value: new Date() }) });

      expect(resp).toBeDefined();
      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.message).toBe(null);
      expect(resp.body.data.length).toBeGreaterThanOrEqual(1);
    });
    
    it('obtem todas as baixas contas receber por valor', async () => {
      const resp = await request(app.getHttpServer()).get(`/conta-receber/baixa/0/5/${JSON.stringify(filter)}`).query({ filter: JSON.stringify({ column: 'valorPago', value: contaReceberBaixaBanco.valorPago }) });;

      expect(resp).toBeDefined();
      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.message).toBe(null);
      expect(resp.body.data.length).toBeGreaterThanOrEqual(1);
    });

  });
});
