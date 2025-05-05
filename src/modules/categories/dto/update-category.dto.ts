import { IsIn, IsOptional } from 'class-validator';

export default class UpdateCategoryDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  slug?: string;

  @IsOptional()
  parent_id?: number;

  @IsOptional()
  image?: string;

  @IsOptional()
  @IsIn(['active', 'inactive'], {
    message: 'Status must be either active or inactive',
  })
  status?: string;
}
