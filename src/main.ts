import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? [process.env.FRONTEND_URL, /\.railway\.app$/] 
      : ['http://localhost:4000', 'http://localhost:3000'],
    credentials: true,
  });

  //auto check condition
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,           // tự động loại bỏ các field không khai báo trong DTO
    forbidNonWhitelisted: true,// báo lỗi nếu có field không nằm trong DTO
    transform: true,           // tự động chuyển kiểu dữ liệu (string -> number...) dựa trên DTO
  }));
  app.useGlobalInterceptors(new TransformInterceptor());

  //swagger
  const config = new DocumentBuilder()
    .setTitle('Tên API của bạn')
    .setDescription('Mô tả API')
    .setVersion('1.0')
    .addTag('tag')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  document.security = [{ bearer: [] }];
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Lưu token khi refresh
    }
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server is running on port ${port}`);
}
bootstrap();