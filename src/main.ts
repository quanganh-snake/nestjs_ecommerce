import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationError, VersioningType } from '@nestjs/common';
import { AllExceptionsFilter } from './common/exceptions/http-exception';
import { ValidationPipe } from '@nestjs/common';
import { errorResponse } from './utils/response';
import { useContainer } from 'class-validator';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  const logDirs = ['logs/info', 'logs/error'];
  logDirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // App use package
  app.useGlobalFilters(new AllExceptionsFilter(logger));
  app.useLogger(logger);
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
