import { IsNotEmpty } from 'class-validator';
import { EMensagem } from '../../../shared/enums/mensagem.enum';
import { ContaReceberBaixa } from 'src/core/conta-receber-baixa/entities/conta-receber-baixa.entity';
import { CreateContaReceberBaixaDto } from 'src/core/conta-receber-baixa/dto/create-conta-receber-baixa.dto';
import { UpdateContaReceberBaixaDto } from 'src/core/conta-receber-baixa/dto/update-conta-receber-baixa.dto';
import { Type } from 'class-transformer';

export class CreateContaReceberDto {
  @IsNotEmpty({ message: `idPessoa ${EMensagem.NaoPodeSerVazio}` })
  idPessoa: number;

  @IsNotEmpty({ message: `pessoa ${EMensagem.NaoPodeSerVazio}` })
  pessoa: string;

  @IsNotEmpty({ message: `idUsuarioLancamento ${EMensagem.NaoPodeSerVazio}` })
  idUsuarioLancamento: number;

  @IsNotEmpty({ message: `valorTotal ${EMensagem.NaoPodeSerVazio}` })
  valorTotal: number;

  @IsNotEmpty({ message: `pago ${EMensagem.NaoPodeSerVazio}` })
  pago: boolean;

}
