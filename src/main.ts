import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerInterceptor } from './modules/shared/interceptors/Logger.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(app.get(LoggerInterceptor));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
