import { IsIn, IsOptional } from 'class-validator';

export default class UpdateBrandDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  slug?: string;

  @IsOptional()
  image?: string;

  @IsOptional()
  @IsIn(['active', 'inactive'], {
    message: 'Status must be either active or inactive',
  })
  status?: string;
}
