export enum LOG_TYPE {
  LOG = 'LOG',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
}

export interface LogProps {
  process: string;
  log: any;
  props: any;
  result?: string;
  type?: LOG_TYPE; 
}

export interface LogRepository {
  error(props: LogProps): Promise<void>;
  warning(props: LogProps): Promise<void>;
  log(props: LogProps): Promise<void>;
  success(props: LogProps): Promise<void>;
}
