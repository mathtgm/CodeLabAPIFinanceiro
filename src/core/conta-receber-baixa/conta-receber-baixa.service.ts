import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ContaReceberBaixa } from './entities/conta-receber-baixa.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { handleFilter } from '../../shared/helpers/sql.helper';
import { IFindAllFilter } from '../../shared/interfaces/find-all-filter.interface';
import { IFindAllOrder } from '../../shared/interfaces/find-all-order.interface';
import { IResponse } from '../../shared/interfaces/response.interface';
import { EMensagem } from '../../shared/enums/mensagem.enum';
import { UpdateContaReceberBaixaDto } from './dto/update-conta-receber-baixa.dto';
import { ClientProxy } from '@nestjs/microservices';
import { readFileSync } from 'fs';
import { lastValueFrom } from 'rxjs';
import { EnviarEmailDto } from '../../shared/dtos/enviar-email.dto';
import { monetaryFormat } from '../../shared/helpers/formatter.helper';
import { IGrpcUsuarioService } from '../../shared/interfaces/grpc-usuario.service';
import { IUsuario } from '../../shared/interfaces/usuario.interface';
import { ExportPdfService } from '../../shared/services/export-pdf.service';
import { ContaReceberService } from '../conta-receber/conta-receber.service';
import { CreateContaReceberBaixaDto } from './dto/create-conta-receber-baixa.dto';
import { ContaReceber } from '../conta-receber/entities/conta-receber.entity';

@Injectable()
export class ContaReceberBaixaService {

  private readonly logger = new Logger(ContaReceberService.name);

  @Inject('MAIL_SERVICE')
  private readonly mailService: ClientProxy;

  @InjectRepository(ContaReceberBaixa)
  private repository: Repository<ContaReceberBaixa>;

  @InjectRepository(ContaReceber)
  private contaReceberRepository: Repository<ContaReceber>;

  @Inject(ExportPdfService)
  private exportPdfService: ExportPdfService;

  private grpcUsuarioService: IGrpcUsuarioService;

  async findAll(
    page: number,
    size: number,
    order: IFindAllOrder,
    filter?: IFindAllFilter | IFindAllFilter[],
  ): Promise<IResponse<ContaReceberBaixa[]>> {

    const where = handleFilter(filter);

    const [data, count] = await this.repository.findAndCount({
      loadEagerRelations: false,
      order: {
        [order.column]: order.sort,
      },
      where,
      skip: size * page,
      take: size,
    });

    return { count, data, message: '' };
  }

  async findOne(id: number): Promise<ContaReceberBaixa> {
    return await this.repository.findOne({
      where: { id: id },
    });
  }

  async create(
    createContaReceberBaixaDto: CreateContaReceberBaixaDto,
  ): Promise<ContaReceberBaixa> {
    const created = this.repository.create(
      new ContaReceberBaixa(createContaReceberBaixaDto),
    );

    const saved = await this.repository.save(created);

    await this.marcaVendaPago(createContaReceberBaixaDto.idContaReceber);

    return saved;
  }

  async update(
    id: number,
    updateContaReceberBaixaDto: UpdateContaReceberBaixaDto,
  ): Promise<ContaReceberBaixa> {
    if (id !== updateContaReceberBaixaDto.id) {
      throw new HttpException(
        EMensagem.IDsDiferentes,
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const saved = await this.repository.save(new ContaReceberBaixa(updateContaReceberBaixaDto));

    await this.marcaVendaPago(updateContaReceberBaixaDto.idContaReceber);

    return saved
  }

  async delete(id: number): Promise<boolean> {
    return await this.repository
      .delete(id)
      .then((result) => result.affected === 1);
  }

  async exportPdf(
    idUsuario: number,
    order: IFindAllOrder,
    filter?: IFindAllFilter | IFindAllFilter[],
  ): Promise<boolean> {
    try {
      const where = handleFilter(filter);

      const size = 100;
      let page = 0;

      const reportData: ContaReceberBaixa[] = [];

      let reportDataTemp: ContaReceberBaixa[] = [];

      do {
        reportDataTemp = await this.repository.find({
          select: ['id', 'idContaReceber', 'idUsuarioBaixa', 'valorPago', 'dataHora'],
          order: {
            [order.column]: order.sort,
          },
          where,
          skip: size * page,
          take: size,
        });

        reportData.push(...reportDataTemp);
        page++;
      } while (reportDataTemp.length === size);

      const filePath = await this.exportPdfService.export(
        'Listagem de ContaReceberBaixa',
        idUsuario,
        {
          columnStyles: {
            2: { halign: 'right' },
            3: { halign: 'center' },
          },
          columns: ['Código', 'ID Venda', 'ID Usuário Baixa', 'Valor Pago', 'Data Criacao'],
          body: reportData.map((contaReceberBaixa) => [
            contaReceberBaixa.id,
            contaReceberBaixa.idContaReceber,
            contaReceberBaixa.idUsuarioBaixa,
            monetaryFormat(contaReceberBaixa.valorPago, 2),
            contaReceberBaixa.dataHora.toDateString(),
          ]),
        },
      );

      const filename = filePath.split('/').pop();
      const filedata = readFileSync(filePath);
      const base64 = filedata.toString('base64');

      const usuario = await this.getUsuarioFromGrpc(idUsuario);

      if (usuario.id === 0) {
        throw new HttpException(
          EMensagem.UsuarioNaoIdentificado,
          HttpStatus.NOT_ACCEPTABLE,
        );
      }

      const data: EnviarEmailDto = {
        subject: 'Exportação de Relatório',
        to: usuario.email,
        template: 'exportacao-relatorio',
        context: {
          name: usuario.nome,
        },
        attachments: [{ filename, base64 }],
      };

      this.mailService.emit('enviar-email', data);

      return true;
    } catch (error) {
      this.logger.error(`Erro ao gerar relatorio pdf: ${error}`);

      throw new HttpException(
        EMensagem.ErroExportarPDF,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async getUsuarioFromGrpc(id: number): Promise<IUsuario> {
    try {
      return (await lastValueFrom(
        this.grpcUsuarioService.FindOne({ id }),
      )) as unknown as IUsuario;
    } catch (error) {
      this.logger.error(`Erro comunicação gRPC - APIUsuario: ${error}`);
      throw new HttpException(
        EMensagem.ErroComunicacaoGrpcUsuario,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async marcaVendaPago(idContaReceber: number) {
    const data = await this.repository.find({ where: { idContaReceber } });
    const venda = await this.contaReceberRepository.findOne({ where: { id: idContaReceber } });
    const total = Number(data.reduce((acumulador, proximo) => acumulador + proximo.valorPago, 0));

    venda.pago = total >= venda.valorTotal;

    await this.contaReceberRepository.save(venda);
  }
}
