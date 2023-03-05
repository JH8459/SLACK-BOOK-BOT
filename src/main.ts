import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';

async function bootstrap() {
  // nestJS 기본 App
  const app = await NestFactory.create(AppModule);
  // config 모듈
  const configService = app.get(ConfigService);
  const SERVER_PORT = configService.get<number>('SERVER_PORT');

  /* Swagger Options Setting, API DOCS 처리 */
  setupSwagger(app);

  await app.listen(SERVER_PORT);
}
bootstrap();
