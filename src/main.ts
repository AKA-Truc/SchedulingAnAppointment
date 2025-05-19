import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //auto check condition
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,           // tự động loại bỏ các field không khai báo trong DTO
    forbidNonWhitelisted: true,// báo lỗi nếu có field không nằm trong DTO
    transform: true,           // tự động chuyển kiểu dữ liệu (string -> number...) dựa trên DTO
  }));

  //swagger
  const config = new DocumentBuilder()
    .setTitle('Tên API của bạn')
    .setDescription('Mô tả API')
    .setVersion('1.0')
    .addTag('tag')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
