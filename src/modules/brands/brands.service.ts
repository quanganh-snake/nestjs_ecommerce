import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brand } from 'src/entities/brand.entity';
import { Brackets, FindOperator, Not, Repository } from 'typeorm';
import CreateBrandDto from './dto/create-brand.dto';
import { createSlug } from 'src/utils/url';
import { generateString } from 'src/utils/utils';
import UpdateBrandDto from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}

  async findAll(query: any): Promise<[Brand[], number]> {
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

    const queryBuilder = this.brandRepository
      .createQueryBuilder('brands')
      .limit(limit)
      .offset(skip)
      .orderBy(`brands.${sort}`, order);

    if (status === 'active' || status === 'inactive') {
      queryBuilder.andWhere('brands.status = :status', { status });
    }

    if (search) {
      // Brackets: là dạng nhóm các điều kiện vào trong 1 nhóm
      // Ta được SQL đầy đủ: SELECT * FROM users WHERE (email LIKE '%search%' OR name LIKE '%search%')
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('brands.name LIKE :search', {
            search: `%${search}%`,
          }).orWhere('brands.slug LIKE :search', {
            search: `%${search}%`,
          });
        }),
      );
    }

    const dataCategories = await queryBuilder.getMany();
    const totalItems = await queryBuilder.getCount();

    return [dataCategories, totalItems];
  }

  async find(id: number): Promise<Brand | null> {
    return this.brandRepository.findOne({
      where: { id },
    });
  }

  // 3. Create
  async create(categoryData: CreateBrandDto): Promise<Brand> {
    const databrandParent: CreateBrandDto = {
      ...categoryData,
    };

    if (!categoryData.slug) {
      const slug = createSlug(databrandParent.name);

      const slugIsExist = await this.findBrandBySlug(slug);
      if (slugIsExist) {
        databrandParent.slug = `${slug}-${generateString(5)}`;
      } else {
        databrandParent.slug = slug;
      }
    }

    const brand = this.brandRepository.create(databrandParent);
    return this.brandRepository.save(brand);
  }

  async findBrandBySlug(slug: string, id?: number): Promise<Brand | null> {
    const where: {
      slug: string;
      id?: FindOperator<number>;
    } = {
      slug,
    };

    if (id) {
      where.id = Not(id);
    }

    return this.brandRepository.findOne({
      where,
    });
  }

  async update(brandData: UpdateBrandDto, id: number) {
    await this.brandRepository.update(id, brandData);
    return this.find(id);
  }
}
