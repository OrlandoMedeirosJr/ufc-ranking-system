import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3001); // 👈 esta linha deve estar 3001
}
bootstrap();
