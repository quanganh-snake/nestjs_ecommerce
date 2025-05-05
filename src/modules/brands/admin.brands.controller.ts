import {
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard } from 'src/common/guards/auth/admin.auth.guard';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { API_VERSION } from 'src/constants/apiVersion';
import { BrandsService } from './brands.service';
import { successResponse } from 'src/utils/response';
import CreateBrandDto from './dto/create-brand.dto';
import UpdateBrandDto from './dto/update-brand.dto';

@Controller({
  path: 'admin/brands',
  version: API_VERSION.V1,
})
@UseGuards(AuthGuard, AdminAuthGuard)
export class AdminBrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  async findAll(@Query() query: any) {
    const [brands, totalItems] = await this.brandsService.findAll(query);
    return successResponse(
      {
        brands,
        totalItems,
      },
      'Get brands successfully',
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const brand = await this.brandsService.find(id);
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    return successResponse(brand, 'Get brand successfully');
  }

  @Post()
  async create(
    @Body()
    { name, slug, image, status }: CreateBrandDto,
  ) {
    const brand = await this.brandsService.create({
      name,
      slug,
      image,
      status,
    });
    return successResponse(brand, 'Create brand successfully');
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body()
    { name, slug, image, status }: UpdateBrandDto,
  ) {
    if (slug) {
      const slugIsExist = await this.brandsService.findBrandBySlug(slug);
      if (slugIsExist) {
        throw new ConflictException('Slug already exists');
      }
    }

    const brand = await this.brandsService.update(
      {
        name,
        slug,
        image,
        status,
      },
      id,
    );
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    return successResponse(brand, 'Update brand successfully');
  }
}
