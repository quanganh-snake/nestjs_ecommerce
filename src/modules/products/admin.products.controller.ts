import {
  BadRequestException,
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { API_VERSION } from 'src/constants/apiVersion';
import { ProductsService } from './products.service';
import { successResponse } from 'src/utils/response';
import CreateProductDto from './dto/create-product.dto';
import UpdateProductDto from './dto/update-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { SYSTEM } from 'src/constants/system';

@Controller({
  path: 'admin/products',
  version: API_VERSION.V1,
})
export class AdminProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Get()
  async findAll(@Query() query: any) {
    const [dataProducts, totalItems] = await this.productService.findAll(query);
    return successResponse(
      {
        dataProducts,
        totalItems,
      },
      'Get products successfully',
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: number, @Query() query: any) {
    const includes = query?.relations ? query?.relations?.split(',') : [];

    const product = await this.productService.find(id, includes);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return successResponse(product, 'Get product successfully');
  }

  @Post()
  async create(@Body() productDto: CreateProductDto) {
    const product = await this.productService.create(productDto);
    return successResponse(product, 'Create product successfully');
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() productDto: UpdateProductDto) {
    const product = await this.productService.update(id, productDto);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return successResponse(product, 'Update product successfully');
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: SYSTEM.MAX_IMAGE_SIZE }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
        fileIsRequired: true,
      }),
    )
    image: Express.Multer.File,
  ) {
    if (!image) {
      throw new BadRequestException(
        'Kích thước hình ảnh lớn hơn (1MB) hoặc không có!',
      );
    }

    // Format file name UTF-8 & Latin
    image.originalname = Buffer.from(image.originalname, 'latin1').toString(
      'utf8',
    );
    image.path = image.path.replace(/\\/g, '/');
    return successResponse(image, 'Upload image for product successfully');
  }
}
