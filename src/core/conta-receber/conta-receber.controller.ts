import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { HttpResponse } from '../../shared/classes/http-response';
import { EMensagem } from '../../shared/enums/mensagem.enum';
import { IFindAllFilter } from '../../shared/interfaces/find-all-filter.interface';
import { IFindAllOrder } from '../../shared/interfaces/find-all-order.interface';
import { IResponse } from '../../shared/interfaces/response.interface';
import { ParseFindAllFilter } from '../../shared/pipes/parse-find-all-filter.pipe';
import { ParseFindAllOrder } from '../../shared/pipes/parse-find-all-order.pipe';
import { ContaReceberService } from './conta-receber.service';
import { CreateContaReceberDto } from './dto/create-conta-receber.dto';
import { UpdateContaReceberDto } from './dto/update-conta-receber.dto';
import { ContaReceber } from './entities/conta-receber.entity';

@Controller('conta-receber')
export class ContaReceberController {
  constructor(private readonly contaReceberService: ContaReceberService) {}

  @Post()
  async create(
    @Body() createContaReceberDto: CreateContaReceberDto,
  ): Promise<IResponse<ContaReceber>> {
    const data = await this.contaReceberService.create(createContaReceberDto);

    return new HttpResponse<ContaReceber>(data).onCreated();
  }

  @Get(':page/:size/:order')
  async findAll(
    @Param('page') page: number,
    @Param('size') size: number,
    @Param('order', ParseFindAllOrder) order: IFindAllOrder,
    @Query('filter', ParseFindAllFilter)
    filter: IFindAllFilter | IFindAllFilter[],
  ): Promise<IResponse<ContaReceber[]>> {
    const {data, count} = await this.contaReceberService.findAll(
      page,
      size,
      order,
      filter,
    );

    return new HttpResponse<ContaReceber[]>(data, null, count);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<IResponse<ContaReceber>> {
    const data = await this.contaReceberService.findOne(+id);

    return new HttpResponse<ContaReceber>(data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateContaReceberDto: UpdateContaReceberDto,
  ): Promise<IResponse<ContaReceber>> {
    const data = await this.contaReceberService.update(
      +id,
      updateContaReceberDto,
    );

    return new HttpResponse<ContaReceber>(data).onUpdated();
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<IResponse<boolean>> {
    const data = await this.contaReceberService.delete(+id);

    return new HttpResponse<boolean>(data).onUnactivated();
  }

  @Get('export/pdf/:idUsuario/:order')
  async exportPdf(
    @Param('idUsuario') idUsuario: number,
    @Param('order', ParseFindAllOrder) order: IFindAllOrder,
    @Query('filter', ParseFindAllFilter)
    filter: IFindAllFilter | IFindAllFilter[],
  ): Promise<IResponse<boolean>> {
    const data = await this.contaReceberService.exportPdf(
      idUsuario,
      order,
      filter,
    );

    return new HttpResponse<boolean>(data).onSuccess(
      EMensagem.IniciadaGeracaoPDF,
    );
  }
}
