import { Controller } from '@nestjs/common';
import { UsersService } from '../users.service';
import { API_VERSION } from 'src/constants/apiVersion';

@Controller({
  path: 'users',
  version: API_VERSION.V1,
})
export class UserController {
  constructor(private readonly userService: UsersService) {}
}
