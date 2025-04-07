import { BadRequestException, Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { API_VERSION } from 'src/constants/apiVersion';

@Controller({
  path: 'users',
  version: API_VERSION.V1
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(){
    const users = [
      {
        name: '1'
      },
      {
        name: '1'
      },
      {
        name: '1'
      }
      ,{
        name: '1'
      },
      {
        name: '1'
      }
    ]
    throw new BadRequestException('400 Ahihi')
    // return successResponse(users, 'OK')
  }
}
