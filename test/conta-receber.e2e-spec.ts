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
import { ContaReceber } from '../src/core/conta-receber/entities/conta-receber.entity';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let contaReceberBanco;
  let repository: Repository<ContaReceber>;

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

    repository = app.get<Repository<ContaReceber>>(getRepositoryToken(ContaReceber));
  });

  afterAll(async () => {
    await repository.delete({});
    await app.close();
  });

  describe('CRUD /', () => {
    let idContaReceber: number;

    const contaReceber = {
      idPessoa: faker.number.int({ min: 1, max: 50 }),
      pessoa: faker.person.fullName(),
      idUsuarioLancamento: faker.number.int({ min: 1, max: 50 }),
      valorTotal: faker.finance.amount({ dec: 3 }),
      pago: faker.datatype.boolean()
    };

    it('criar uma nova conta a receber', async () => {
      const resp = await request(app.getHttpServer())
        .post('/conta-receber')
        .send(contaReceber);

      expect(resp).toBeDefined();
      expect(resp.body.message).toBe(EMensagem.SalvoSucesso);
      expect(resp.body.data).toHaveProperty('id');

      idContaReceber = resp.body.data.id;
    });

    it('carregar a conta receber criada', async () => {
      const resp = await request(app.getHttpServer()).get(`/conta-receber/${+idContaReceber}`);

      expect(resp).toBeDefined();
      expect(resp.body.message).toBe(null);
      expect(resp.body.data.idPessoa).toBe(contaReceber.idPessoa);
      expect(resp.body.data.pessoa).toBe(contaReceber.pessoa);
      expect(resp.body.data.idUsuarioLancamento).toBe(contaReceber.idUsuarioLancamento);
      expect(resp.body.data.valorTotal).toBe(contaReceber.valorTotal);
      expect(resp.body.data.pago).toBe(contaReceber.pago);
    });

    it('altera o conta receber criada', async () => {
      const financeiroAlterado = Object.assign(
        { id: idContaReceber, pago: false },
        contaReceber,
        {},
      );

      const resp = await request(app.getHttpServer())
        .patch(`/conta-receber/${+idContaReceber}`)
        .send(financeiroAlterado);

      expect(resp).toBeDefined();
      expect(resp.body.message).toBe(EMensagem.AtualizadoSucesso);
      expect(resp.body.data).toHaveProperty('id');
      expect(resp.body.data.idPessoa).toBe(contaReceber.idPessoa);
      expect(resp.body.data.pessoa).toBe(contaReceber.pessoa);
      expect(resp.body.data.idUsuarioLancamento).toBe(contaReceber.idUsuarioLancamento);
      expect(resp.body.data.valorTotal).toBe(contaReceber.valorTotal);
      expect(resp.body.data.pago).toBe(contaReceber.pago);
    });

    it('tenta alterar o financeiro criado passando um id diferente', async () => {
      const financeiroAlterado = Object.assign(contaReceber, {
        id: +idContaReceber,
        pago: true
      });

      const resp = await request(app.getHttpServer())
        .patch(`/conta-receber/999`)
        .send(financeiroAlterado);

      expect(resp.status).toBe(HttpStatus.NOT_ACCEPTABLE);
      expect(resp.body.message).toBe(EMensagem.IDsDiferentes);
      expect(resp.body.data).toBe(null);
    });

    it('excluir uma conta receber criada', async () => {
      const resp = await request(app.getHttpServer()).delete(`/conta-receber/${+idContaReceber}`);

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

        const resp = await request(app.getHttpServer()).post('/conta-receber').send(contaReceber);
        contaReceberBanco = resp.body.data;
      }

      const resp = await request(app.getHttpServer()).get(`/conta-receber/0/5/${JSON.stringify(filter)}`);

      expect(resp).toBeDefined();
      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.message).toBe(null);
      expect(resp.body.data.length).toBe(5);
    });

    it('obtem todos os registros da página 2', async () => {
      const resp = await request(app.getHttpServer()).get(`/conta-receber/1/5/${JSON.stringify(filter)}`);

      expect(resp).toBeDefined();
      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.message).toBe(null);
      expect(resp.body.data.length).toBeGreaterThan(1);
    });

    it('obtem todas as conta receber por pessoa', async () => {

      const resp = await request(app.getHttpServer()).get(`/conta-receber/0/5/${JSON.stringify(filter)}`).query({ filter: JSON.stringify({ column: 'pessoa', value: contaReceberBanco.pessoa }) });

      expect(resp).toBeDefined();
      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.message).toBe(null);
      expect(resp.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('obtem todas as contas a receber pelo id', async () => {
      const resp = await request(app.getHttpServer()).get(`/conta-receber/0/5/${JSON.stringify(filter)}`).query({ filter: JSON.stringify({ column: 'id', value: contaReceberBanco.id }) });

      expect(resp).toBeDefined();
      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.message).toBe(null);
      expect(resp.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('obtem todas as contas receber pagas', async () => {
      const resp = await request(app.getHttpServer()).get(`/conta-receber/0/5/${JSON.stringify(filter)}`).query({ filter: JSON.stringify({ column: 'pago', value: false }) });;

      expect(resp).toBeDefined();
      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.message).toBe(null);
      expect(resp.body.data.length).toBeGreaterThanOrEqual(1);
    });

  });
});
