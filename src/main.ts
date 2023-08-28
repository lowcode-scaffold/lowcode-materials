import { NestFactory } from '@nestjs/core';
// eslint-disable-next-line import/no-unresolved
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
