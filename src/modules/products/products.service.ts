import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/entities/product.entity';
import { Brackets, FindOperator, Not, Repository } from 'typeorm';
import CreateProductDto from './dto/create-product.dto';
import { createSlug } from 'src/utils/url';
import { generateString } from 'src/utils/utils';
import { BrandsService } from '../brands/brands.service';
import UpdateProductDto from './dto/update-product.dto';
import * as fs from 'fs';
import { CategoriesService } from '../categories/categories.service';
import { Category } from 'src/entities/category.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly brandsService: BrandsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async findAll(query: any): Promise<[Product[], number]> {
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

    const queryBuilder = this.productRepository
      .createQueryBuilder('products')
      .limit(limit)
      .offset(skip)
      .orderBy(`products.${sort}`, order)
      .leftJoinAndSelect('products.brand', 'brand'); // Join with brand table;
    if (status === 'active' || status === 'inactive') {
      queryBuilder.andWhere('products.status = :status', { status });
    }

    if (search) {
      // Brackets: là dạng nhóm các điều kiện vào trong 1 nhóm
      // Ta được SQL đầy đủ: SELECT * FROM users WHERE (email LIKE '%search%' OR name LIKE '%search%')
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('products.name LIKE :search', {
            search: `%${search}%`,
          }).orWhere('products.slug LIKE :search', {
            search: `%${search}%`,
          });
        }),
      );
    }

    const dataProducts = await queryBuilder.getMany();
    const totalItems = await queryBuilder.getCount();

    return [dataProducts, totalItems];
  }

  async find(id: number, relations?: string[]): Promise<Product | null> {
    const findOptions: {
      where: { id: number };
      relations?: string[];
    } = {
      where: { id },
    };

    if (relations) {
      findOptions.relations = relations;
    }

    const product = await this.productRepository.findOne(findOptions);
    return product;
  }

  async create(productData: CreateProductDto) {
    const dataProduct = new Product();

    dataProduct.name = productData.name;
    dataProduct.slug = productData.slug || createSlug(productData.name);
    dataProduct.sku = productData.sku;
    dataProduct.thumbnail = productData.thumbnail;
    dataProduct.quantity = productData.quantity;
    dataProduct.price = productData.price || 0;
    dataProduct.sale_price = productData.sale_price || 0;
    dataProduct.rating_ammount = productData.rating_ammount || 0;
    dataProduct.content = productData.content;
    dataProduct.type = productData.type;
    dataProduct.status = productData.status;

    if (!productData.slug) {
      const slug = createSlug(productData.name);

      const slugIsExist = await this.findProductBySlug(slug);
      if (slugIsExist) {
        productData.slug = `${slug}-${generateString(5)}`;
      } else {
        productData.slug = slug;
      }
    }

    // Kiểm tra và set brand
    if (productData.brand_id) {
      const brand = await this.brandsService.find(productData.brand_id);
      if (brand) {
        dataProduct.brand = brand;
      }
    }

    // Kiểm tra và set categories (ManyToMany)
    if (productData.categories?.length) {
      const categories = await Promise.all(
        productData.categories.map((id) => this.categoriesService.find(id)),
      );
      dataProduct.categories = dataProduct.categories = categories.filter(
        (category): category is Category => category !== null,
      );
    }

    const productSaved = await this.productRepository.save(dataProduct);

    if (productSaved.thumbnail) {
      productSaved.thumbnail = `${process.env.APP_URL}/${productSaved.thumbnail}`;
    }

    return productSaved;
  }

  async findProductBySlug(slug: string, id?: number): Promise<Product | null> {
    const where: {
      slug: string;
      id?: FindOperator<number>;
    } = {
      slug,
    };

    if (id) {
      where.id = Not(id);
    }

    return this.productRepository.findOne({
      where,
    });
  }

  async update(id: number, productData: UpdateProductDto) {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      return null;
    }

    // Cập nhật trực tiếp các trường đã thay đổi
    if (productData.price !== undefined) {
      product.price = productData.price;
    }

    if (productData.sale_price !== undefined) {
      product.sale_price = productData.sale_price;
    }

    if (productData?.thumbnail) {
      product.thumbnail = `${process.env.APP_URL}/${productData.thumbnail}`;
    }

    if (productData?.brand_id) {
      const brand = await this.brandsService.find(productData.brand_id);
      if (brand) {
        product.brand = brand;
      }
    }

    if (productData?.categories) {
      const categoryEntities = await Promise.all(
        productData.categories.map((id) => this.categoriesService.find(id)),
      );
      product.categories = categoryEntities.filter(
        (c): c is Category => c !== null,
      );
    }

    // Cập nhật các trường khác trong product nếu có sự thay đổi
    product.name = productData.name ?? product.name;
    product.slug = productData.slug ?? product.slug;
    product.sku = productData.sku ?? product.sku;
    product.content = productData.content ?? product.content;
    product.type = productData.type ?? product.type;
    product.status = productData.status ?? product.status;

    // Lưu lại sản phẩm đã được cập nhật
    await this.productRepository.save(product);

    return product;
  }

  async delete(id: number) {
    const product = await this.find(id);
    if (!product) {
      return null;
    }

    // await this.productRepository.delete(id);
    if (product.thumbnail) {
      fs.unlinkSync(`${process.cwd()}/${product.thumbnail}`);
    }

    return product;
  }
}
