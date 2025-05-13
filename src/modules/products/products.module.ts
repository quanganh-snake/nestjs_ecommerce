import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { AdminProductsController } from './admin.products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/entities/product.entity';
import { BrandsModule } from '../brands/brands.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidV4 } from 'uuid';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    BrandsModule,
    CategoriesModule,
    MulterModule.register({
      dest: './public/storage',
      storage: diskStorage({
        destination: './public/storage/products',
        filename: (req, file, cb) => {
          const extFile = file.originalname?.split('.').pop();
          const fileName = `${uuidV4().toString()}.${extFile}`;
          cb(null, fileName);
        },
      }),
    }),
  ],
  controllers: [ProductsController, AdminProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
