import { IsDefined, IsIn, IsOptional } from 'class-validator';
import { isUnique } from 'src/common/validation/UniqueConstraint';

export default class CreateBrandDto {
  @IsDefined({
    message: 'Name brand is required',
  })
  name: string;

  @IsOptional()
  @isUnique(
    {
      tableName: 'brand',
      columnName: 'slug',
    },
    {
      message: 'Slug đã tồn tại',
    },
  )
  slug?: string;

  @IsOptional()
  @IsIn(['active', 'inactive'], {
    message: 'Status must be active or inactive',
  })
  status?: string;

  @IsOptional()
  image?: string;
}
