import { IsNotEmpty } from 'class-validator';
import { EMensagem } from '../../../shared/enums/mensagem.enum';

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
