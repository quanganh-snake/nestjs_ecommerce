import { Exclude, Expose, Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { isUnique } from 'src/common/validation/UniqueConstraint';
import { Brand } from 'src/entities/brand.entity';

@Exclude()
export default class CreateProductDto {
  @Expose()
  @IsDefined({
    message: 'Product name is required',
  })
  @IsNotEmpty({
    message: 'Product name is required',
  })
  name: string;

  @Expose()
  @IsDefined({
    message: 'Product slug is required',
  })
  @isUnique(
    {
      tableName: 'products',
      columnName: 'slug',
    },
    {
      message: 'Slug must be unique',
    },
  )
  slug: string;

  @Expose()
  @IsDefined({
    message: 'Product sku is required',
  })
  @isUnique(
    {
      tableName: 'products',
      columnName: 'sku',
    },
    {
      message: 'Sku must be unique',
    },
  )
  sku: string;

  @Expose()
  @IsNotEmpty({
    message: 'Product thumbnail is required',
  })
  thumbnail: string;

  @Expose()
  @IsNotEmpty({
    message: 'Product quantity is required',
  })
  quantity: number;

  @Expose()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? undefined : parsed;
  })
  price?: number = 0;

  @Expose()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? undefined : parsed;
  })
  sale_price?: number = 0;

  @Expose()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? undefined : parsed;
  })
  rating_ammount?: number = 0;

  @Expose()
  @IsNotEmpty({
    message: 'Product description is required',
  })
  content: string;

  @Expose()
  @IsIn(['simple', 'variant'], {
    message: 'Status must be simple or variant',
  })
  type: string;

  @Expose()
  @IsIn(['active', 'inactive'], {
    message: 'Status must be active or inactive',
  })
  status: string;

  @IsOptional()
  @Expose()
  brand_id?: number;

  @IsOptional()
  @Expose()
  brand?: Brand;

  @Expose()
  @IsArray({
    message: 'Product categories is required',
  })
  @Type(() => Number)
  @ArrayMinSize(1, {
    message: 'Product categories need at least one category',
  })
  @IsNumber({}, { each: true, message: 'Each category ID must be a number' })
  categories: number[];
}
