import { IsDefined, IsIn, IsOptional } from 'class-validator';
import { isUnique } from 'src/common/validation/UniqueConstraint';

export default class CreateCategoryDto {
  @IsDefined({
    message: 'Name category is required',
  })
  name: string;

  @IsOptional()
  @isUnique(
    {
      tableName: 'categories',
      columnName: 'slug',
    },
    {
      message: 'Slug đã tồn tại',
    },
  )
  slug?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsIn(['active', 'inactive'], {
    message: 'Status must be active or inactive',
  })
  status?: string;

  @IsOptional()
  parent_id?: number;

  @IsOptional()
  image?: string;
}
