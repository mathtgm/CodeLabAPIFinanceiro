import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  Closeable,
} from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { grpcClientConfig } from '../../config/grpc/grpc.config';
import { ExportPdfService } from '../../shared/services/export-pdf.service';
import { RmqClientService } from '../../shared/services/rmq-client.service';
import { ContaReceberBaixaService } from './conta-receber-baixa.service';
import { ContaReceberBaixa } from './entities/conta-receber-baixa.entity';
import { ContaReceberBaixaController } from './conta-receber-baixa.controller';
import { ContaReceber } from '../conta-receber/entities/conta-receber.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContaReceberBaixa, ContaReceber])],
  controllers: [ContaReceberBaixaController],
  providers: [
    ContaReceberBaixaService,
    ExportPdfService,
    RmqClientService,
    {
      provide: 'MAIL_SERVICE',
      useFactory: async (
        rmqClientService: RmqClientService,
      ): Promise<ClientProxy & Closeable> => {
        return rmqClientService.createRabbitmqOptions('mail.enviar-email');
      },
      inject: [RmqClientService],
    },
    {
      provide: 'GRPC_USUARIO',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create(
          grpcClientConfig('usuario', 'GRPC_USUARIO', configService),
        );
      },
      inject: [ConfigService],
    },
  ],
})
export class ContaReceberBaixaModule {}
