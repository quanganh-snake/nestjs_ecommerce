import { PartialType } from '@nestjs/mapped-types';
import { Expose } from 'class-transformer';
import { isUnique } from 'src/common/validation/UniqueConstraint';
import CreateProductDto from './create-product.dto';

export default class UpdateProductDto extends PartialType(CreateProductDto) {
  @Expose()
  @isUnique(
    {
      tableName: 'products',
      columnName: 'slug',
    },
    {
      message: 'Slug must be unique',
    },
  )
  slug?: string;
}
