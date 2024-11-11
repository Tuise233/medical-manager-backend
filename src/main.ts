import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 跨域配置
  app.enableCors({
    origin: (origin, callback) => {
      // 开发环境下允许所有源访问
      if (process.env.NODE_ENV === 'development') {
        callback(null, true);
        return;
      }

      const allowedOrigins = [
        'http://localhost',
        'http://localhost:8848',
        'http://localhost:3000',
      ];
      
      // 允许没有 origin 的请求（比如移动端应用）
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.some(allowedOrigin => origin.startsWith(allowedOrigin))) {
        callback(null, true);
      } else {
        callback(new Error('不允许的跨域请求'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
