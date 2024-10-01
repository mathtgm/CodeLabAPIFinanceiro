import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { HttpResponse } from '../../shared/classes/http-response';
import { EMensagem } from '../../shared/enums/mensagem.enum';
import { IFindAllFilter } from '../../shared/interfaces/find-all-filter.interface';
import { IFindAllOrder } from '../../shared/interfaces/find-all-order.interface';
import { IResponse } from '../../shared/interfaces/response.interface';
import { ParseFindAllFilter } from '../../shared/pipes/parse-find-all-filter.pipe';
import { ParseFindAllOrder } from '../../shared/pipes/parse-find-all-order.pipe';
import { ContaReceberBaixaService } from './conta-receber-baixa.service';
import { ContaReceberBaixa } from './entities/conta-receber-baixa.entity';
import { CreateContaReceberBaixaDto } from './dto/create-conta-receber-baixa.dto';
import { UpdateContaReceberBaixaDto } from './dto/update-conta-receber-baixa.dto';

@Controller('conta-receber/baixa')
export class ContaReceberBaixaController {
    constructor(private readonly contaReceberBaixaService: ContaReceberBaixaService) {}

  @Post()
  async create(
    @Body() createContaReceberBaixaDto: CreateContaReceberBaixaDto,
  ): Promise<IResponse<ContaReceberBaixa>> {
    const data = await this.contaReceberBaixaService.create(createContaReceberBaixaDto);

    return new HttpResponse<ContaReceberBaixa>(data).onCreated();
  }

  @Get(':page/:size/:order')
  async findAll(
    @Param('page') page: number,
    @Param('size') size: number,
    @Param('order', ParseFindAllOrder) order: IFindAllOrder,
    @Query('filter', ParseFindAllFilter)
    filter: IFindAllFilter | IFindAllFilter[],
  ): Promise<IResponse<ContaReceberBaixa[]>> {
    const {data, count} = await this.contaReceberBaixaService.findAll(
      page,
      size,
      order,
      filter,
    );

    return new HttpResponse<ContaReceberBaixa[]>(data, null, count);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<IResponse<ContaReceberBaixa>> {
    const data = await this.contaReceberBaixaService.findOne(+id);

    return new HttpResponse<ContaReceberBaixa>(data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateContaReceberDto: UpdateContaReceberBaixaDto,
  ): Promise<IResponse<ContaReceberBaixa>> {
    const data = await this.contaReceberBaixaService.update(
      +id,
      updateContaReceberDto,
    );

    return new HttpResponse<ContaReceberBaixa>(data).onUpdated();
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<IResponse<boolean>> {
    const data = await this.contaReceberBaixaService.delete(+id);

    return new HttpResponse<boolean>(data).onUnactivated();
  }

  @Get('export/pdf/:idUsuario/:order')
  async exportPdf(
    @Param('idUsuario') idUsuario: number,
    @Param('order', ParseFindAllOrder) order: IFindAllOrder,
    @Query('filter', ParseFindAllFilter)
    filter: IFindAllFilter | IFindAllFilter[],
  ): Promise<IResponse<boolean>> {
    const data = await this.contaReceberBaixaService.exportPdf(
      idUsuario,
      order,
      filter,
    );

    return new HttpResponse<boolean>(data).onSuccess(
      EMensagem.IniciadaGeracaoPDF,
    );
  }
}
