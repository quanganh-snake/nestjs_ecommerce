import { Module } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { AdminBrandsController } from './admin.brands.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from 'src/entities/brand.entity';
import { AuthModule } from '../auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidV4 } from 'uuid';

@Module({
  imports: [
    TypeOrmModule.forFeature([Brand]),
    AuthModule,
    MulterModule.register({
      dest: './public/storage',
      storage: diskStorage({
        destination: './public/storage/brands',
        filename: (req, file, cb) => {
          const extFile = file.originalname?.split('.').pop();
          const fileName = `${uuidV4().toString()}.${extFile}`;
          cb(null, fileName);
        },
      }),
    }),
  ],
  controllers: [BrandsController, AdminBrandsController],
  providers: [BrandsService],
  exports: [BrandsService],
})
export class BrandsModule {}
