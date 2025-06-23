import { NestFactory } from '@nestjs/core';
import { AppModule } from './module/app/app.module';
import { API_PREFIX, PORT } from './shared/constant/global.constant';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(API_PREFIX);
  useContainer(app.select(AppModule), { fallbackOnErrors: true }); // class-validator ngikut DI Nest

  app.enableCors({
    origin: '*',
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });
  console.log(PORT);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('VERSION:', process.env.VERSION);
  console.log('PORT:', process.env.PORT);

  await app.listen(PORT, () => {
    console.log(`Auth service started listening: ${PORT}`);
  });
}

bootstrap();
