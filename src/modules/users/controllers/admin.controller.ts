import { Controller } from '@nestjs/common';
import { UsersService } from '../users.service';
import { API_VERSION } from 'src/constants/apiVersion';

@Controller({
  path: 'admin',
  version: API_VERSION.V1,
})
export class AdminController {
  constructor(private readonly userService: UsersService) {}
}
