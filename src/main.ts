import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,           // tự động loại bỏ các field không khai báo trong DTO
    forbidNonWhitelisted: true,// báo lỗi nếu có field không nằm trong DTO
    transform: true,           // tự động chuyển kiểu dữ liệu (string -> number...) dựa trên DTO
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
