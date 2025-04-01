import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS para permitir solicitações do frontend
  app.enableCors({
    origin: true, // Permitir qualquer origem
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
