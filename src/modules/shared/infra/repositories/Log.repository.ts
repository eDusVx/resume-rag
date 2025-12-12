import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    LOG_TYPE,
  LogProps,
  LogRepository,
} from '../../domain/repositories/Log.repository';
import { LogModel } from '../models/Log.model';

@Injectable()
export class LogRepositoryImpl implements LogRepository {
  constructor(
    @InjectRepository(LogModel)
    private readonly logRepository: Repository<LogModel>,
  ) {}

  async log(props: LogProps): Promise<void> {
    await this.saveLog(props, LOG_TYPE.LOG);
  }

  async success(props: LogProps): Promise<void> {
    await this.saveLog(props, LOG_TYPE.SUCCESS);
  }

  async error(props: LogProps): Promise<void> {
    await this.saveLog(props, LOG_TYPE.ERROR);
  }

  async warning(props: LogProps): Promise<void> {
    await this.saveLog(props, LOG_TYPE.WARNING);
  }

  private async saveLog(props: LogProps, type: LOG_TYPE): Promise<void> {
    await this.logRepository.save({
      process: props.process,
      log: JSON.stringify(props.log),
      props:
        typeof props.props === 'object'
          ? JSON.stringify(props.props)
          : props.props,
      result: props.result,
      type: type,
    });
  }
}
