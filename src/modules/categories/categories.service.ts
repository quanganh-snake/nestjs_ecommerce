import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { Brackets, FindOperator, Not, Repository } from 'typeorm';
import CreateCategoryDto from './dto/create-category.dto';
import { createSlug } from 'src/utils/url';
import { generateString } from 'src/utils/utils';
import UpdateCategoryDto from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(query: any): Promise<[Category[], number]> {
    const {
      page,
      limit,
      sort = 'id',
      order = 'ASC',
      status = '',
      search = '',
      ...where
    } = query;
    const skip = page ? (page - 1) * limit : 0;

    const queryBuilder = this.categoryRepository
      .createQueryBuilder('catgegories')
      .limit(limit)
      .offset(skip)
      .orderBy(`catgegories.${sort}`, order);

    if (status === 'active' || status === 'inactive') {
      queryBuilder.andWhere('catgegories.status = :status', { status });
    }

    if (search) {
      // Brackets: là dạng nhóm các điều kiện vào trong 1 nhóm
      // Ta được SQL đầy đủ: SELECT * FROM users WHERE (email LIKE '%search%' OR name LIKE '%search%')
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('catgegories.name LIKE :search', {
            search: `%${search}%`,
          }).orWhere('catgegories.slug LIKE :search', {
            search: `%${search}%`,
          });
        }),
      );
    }

    const dataCategories = await queryBuilder.getMany();
    const totalItems = await queryBuilder.getCount();

    return [dataCategories, totalItems];
  }

  async find(id: number, relations: any = {}): Promise<Category | null> {
    console.log('🚀 ~ CategoriesService ~ findOne ~ relations:', id, relations);

    return this.categoryRepository.findOne({
      where: { id },
      relations: {
        children: true,
      },
    });
  }

  // 3. Create
  async create(categoryData: CreateCategoryDto): Promise<Category> {
    const dataCategoryParent: CreateCategoryDto & { parent?: Category } = {
      ...categoryData,
    };

    if (!categoryData.slug) {
      const slug = createSlug(dataCategoryParent.name);

      const slugIsExist = await this.findCategoryBySlug(slug);
      if (slugIsExist) {
        dataCategoryParent.slug = `${slug}-${generateString(5)}`;
      } else {
        dataCategoryParent.slug = slug;
      }
    }

    // check parent_id
    const parentId = categoryData.parent_id;

    if (parentId) {
      const parentCategory = await this.categoryRepository.findOne({
        where: { id: parentId },
      });

      if (parentCategory) {
        dataCategoryParent.parent = parentCategory;
      }
      delete dataCategoryParent.parent_id;
    }

    const category = this.categoryRepository.create(dataCategoryParent);
    return this.categoryRepository.save(category);
  }

  // 4. Update
  async update(category: UpdateCategoryDto, id: number) {
    const dataUpdateCategory: UpdateCategoryDto & { parent?: Category } = {
      ...category,
    };

    const parentId = dataUpdateCategory.parent_id;
    if (parentId) {
      const parentCategory = await this.categoryRepository.findOne({
        where: { id: parentId },
      });

      if (parentCategory) {
        dataUpdateCategory.parent = parentCategory;
      }
      delete dataUpdateCategory.parent_id;
    }

    await this.categoryRepository.update(id, dataUpdateCategory);
    return this.find(id);
  }

  async findCategoryBySlug(
    slug: string,
    id?: number,
  ): Promise<Category | null> {
    const where: {
      slug: string;
      id?: FindOperator<number>;
    } = {
      slug,
    };

    if (id) {
      where.id = Not(id);
    }

    return this.categoryRepository.findOne({
      where,
    });
  }

  async delete(id: number) {
    const category = await this.find(id, {
      children: true,
      parent: true,
    });
    // if (category?.children?.length) {
    //   // TH: Category has children
    //   for (const categoryChildren of category.children) {
    //     //@ts-ignore
    //     categoryChildren.parent = null;
    //     await this.update(categoryChildren, categoryChildren.id);
    //   }
    // }
    if (!category) {
      return false;
    }

    // await this.categoryRepository.delete(id);
    return category;
  }
}
