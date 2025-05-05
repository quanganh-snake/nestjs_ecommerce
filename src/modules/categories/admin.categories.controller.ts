import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { API_VERSION } from 'src/constants/apiVersion';
import { CategoriesService } from './categories.service';
import { successResponse } from 'src/utils/response';
import CreateCategoryDto from './dto/create-category.dto';
import UpdateCategoryDto from './dto/update-category.dto';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { AdminAuthGuard } from 'src/common/guards/auth/admin.auth.guard';

@Controller({
  path: 'admin/categories',
  version: API_VERSION.V1,
})
@UseGuards(AuthGuard, AdminAuthGuard)
export class AdminCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll(@Query() query: any) {
    const [categories, totalItems] =
      await this.categoriesService.findAll(query);
    return successResponse(
      {
        categories,
        totalItems,
      },
      'Get categories successfully',
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const category = await this.categoriesService.find(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return successResponse(category, 'Get category successfully');
  }

  @Post()
  async create(
    @Body()
    { name, description, slug, parent_id, image, status }: CreateCategoryDto,
  ) {
    const category = await this.categoriesService.create({
      name,
      description,
      slug,
      parent_id,
      image,
      status,
    });
    return successResponse(category, 'Create category successfully');
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body()
    { name, description, slug, parent_id, image, status }: UpdateCategoryDto,
  ) {
    if (slug) {
      const slugIsExist = await this.categoriesService.findCategoryBySlug(slug);
      if (slugIsExist) {
        throw new ConflictException('Slug already exists');
      }
    }

    const category = await this.categoriesService.update(
      {
        name,
        description,
        slug,
        parent_id,
        image,
        status,
      },
      id,
    );
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return successResponse(category, 'Update category successfully');
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    const category = await this.categoriesService.find(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return successResponse(category, 'Delete category successfully');
  }
}
