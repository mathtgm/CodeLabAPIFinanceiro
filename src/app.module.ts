import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './config/database/database.module';
import { ContaReceberModule } from './core/conta-receber/conta-receber.module';
import { LoggerMiddleware } from './shared/middleware/logger.middleware';
import { ContaReceberBaixaModule } from './core/conta-receber-baixa/conta-receber-baixa.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env${
        process.env.NODE_ENV ? '.' + process.env.NODE_ENV : ''
      }`,
      isGlobal: true,
    }),

    DatabaseModule,
    ContaReceberModule,
    ContaReceberBaixaModule
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}