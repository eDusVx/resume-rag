import { Module } from '@nestjs/common';
import { LogModel } from './infra/models/Log.model';
import { LogRepositoryImpl } from './infra/repositories/Log.repository';
import { LogServiceImpl } from './infra/services/Log.service';
import { LoggerInterceptor } from './interceptors/Logger.interceptor';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedController } from './shared.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LogModel])],
  controllers: [SharedController],
  providers: [
    {
      provide: 'LogRepository',
      useClass: LogRepositoryImpl,
    },
    {
      provide: 'LogService',
      useClass: LogServiceImpl,
    },
    LoggerInterceptor,
  ],
})
export class SharedModule {}
