import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Inject,
  Logger,
  HttpException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import type { LogService } from '../domain/services/Log.service';
import { Request } from 'express';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private logger = new Logger('UseCaseLogger');
  private readonly SENSITIVE_KEYS = [
    'senha', 'password', 'token', 'authorization', 'secret', 'cvv'
  ];

  constructor(
    @Inject('LogService')
    private readonly logService: LogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const handlerName = context.getHandler().name;
    if (['Hc', 'Liveness'].includes(handlerName)) {
        return next.handle();
    }
    const process = handlerName;

    let initialProps = this.extractAllProps(request);
    const initialPropsStr = JSON.stringify(this.sanitizeRecursive(initialProps));

    this.logger.debug(`[INICIO] ${handlerName} | Dados Iniciais: ${initialPropsStr}`);
    
    this.logService.log({
      process,
      log: `Processo iniciado`,
      props: initialPropsStr,
    }).catch(() => {}); 

    const startTime = Date.now();

    return next.handle().pipe(
      tap((response) => {
        const duration = Date.now() - startTime;
        
        const finalProps = this.extractAllProps(request);
        const finalPropsStr = JSON.stringify(this.sanitizeRecursive(finalProps));

        const resultSanitized = this.sanitizeResponse(response);

        this.logger.debug(
          `[SUCESSO] ${handlerName} (${duration}ms) | Inputs Finais: ${finalPropsStr}`,
        );
        
        this.logService.success({
          process,
          log: `Finalizado com sucesso em ${duration}ms`,
          props: finalPropsStr,
          result: JSON.stringify(resultSanitized),
        }).catch(() => {});
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        
        const finalProps = this.extractAllProps(request);
        const finalPropsStr = JSON.stringify(this.sanitizeRecursive(finalProps));

        const { message, details } = this.extractErrorDetails(error);

        this.logger.error(`[ERRO] ${handlerName} (${duration}ms) | Msg: ${message}`);

        this.logService.error({
          process,
          log: `Falha após ${duration}ms: ${message}`,
          props: finalPropsStr,
          result: JSON.stringify(details),
        }).catch(() => {});

        throw error;
      }),
    );
  }

  private extractAllProps(req: any): Record<string, any> {
    const props: Record<string, any> = {};

    if (req.params) Object.assign(props, req.params);
    if (req.query) Object.assign(props, req.query);
    if (req.body) {
      props.body = Object.assign({}, req.body);
    }
    if (req.file) {
      props.uploadedFile = this.formatFileMeta(req.file);
    }

    if (req.files) {
      if (Array.isArray(req.files)) {
        props.uploadedFiles = req.files.map((f: any) => this.formatFileMeta(f));
      } else {
        props.uploadedFiles = {};
        for (const key in req.files) {
          props.uploadedFiles[key] = req.files[key].map((f: any) => this.formatFileMeta(f));
        }
      }
    }

    return props;
  }

  private formatFileMeta(file: any) {
    return {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: `${(file.size / 1024).toFixed(2)} KB`,
    };
  }

  private sanitizeRecursive(obj: any): any {
    if (!obj) return obj;
    if (Buffer.isBuffer(obj)) return '[Binary Data]';
    if (Array.isArray(obj)) return obj.map(v => this.sanitizeRecursive(v));
    if (typeof obj === 'object') {
      const cleanObj: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          if (this.SENSITIVE_KEYS.some(s => key.toLowerCase().includes(s))) {
            cleanObj[key] = '[REDACTED]';
          } else {
            cleanObj[key] = this.sanitizeRecursive(obj[key]);
          }
        }
      }
      return cleanObj;
    }
    return obj;
  }

  private sanitizeResponse(response: any): any {
    if (Array.isArray(response) && response.length > 20) {
      return {
        _summary: `Array com ${response.length} itens (truncado)`,
        sample: response.slice(0, 3).map(i => this.sanitizeRecursive(i))
      };
    }
    return this.sanitizeRecursive(response);
  }

  private extractErrorDetails(error: any) {
    let message = 'Internal Server Error';
    let details = error;
    if (error instanceof HttpException) {
      message = error.message;
      details = error.getResponse();
    } else if (error instanceof Error) {
      message = error.message;
      details = { stack: error.stack };
    }
    return { message, details };
  }
}