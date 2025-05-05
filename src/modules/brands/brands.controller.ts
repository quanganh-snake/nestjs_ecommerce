import { Controller } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { API_VERSION } from 'src/constants/apiVersion';

@Controller({
  path: 'brands',
  version: API_VERSION.V1,
})
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}
}
