import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  ValidationError,
  VersioningType,
} from '@nestjs/common';
import { AllExceptionsFilter } from './common/exceptions/http-exception';
import { ValidationPipe } from '@nestjs/common';
import { errorResponse } from './utils/response';
import { useContainer } from 'class-validator';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.useGlobalFilters(new AllExceptionsFilter());
  // Áp dụng validation-pipe cho toàn bộ ứng dụng
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true, // Dừng kiểm tra ngay khi gặp lỗi đầu tiên của DTO
      // Tự động loại bỏ các trường không cần thiết
      transform: true,
      // Tự động loại bỏ các trường không được khai báo
      whitelist: true,
      forbidNonWhitelisted: true,
      // Tự động chuyển đổi kiểu dữ liệu của các trường
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors: ValidationError[]) => {
        const formattedErrors = errors.map((err) => ({
          field: err.property,
          message: Object.values(err.constraints ?? {})[0],
        }));

        return errorResponse(formattedErrors, 'Validation failed');
      },
    }),
  );

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
