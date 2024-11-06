import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // // 跨域
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = ['http://localhost', 'http://localhost:8848'];
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(new Error('跨域发生错误'), false);
      }
      return callback(null, true);
    },
    credentials: true
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
