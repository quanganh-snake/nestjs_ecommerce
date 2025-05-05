import {
  Controller,
  Get,
  Post,
  Body,
  BadRequestException,
  Put,
  Param,
  NotFoundException,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../users.service';
import { API_VERSION } from 'src/constants/apiVersion';
import { CreateUserDto } from '../dto/create-user.dto';
import { successResponse } from 'src/utils/response';
import UpdateUserDto from '../dto/update-user.dto';
import { SYSTEM } from 'src/constants/system';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { AdminAuthGuard } from 'src/common/guards/auth/admin.auth.guard';
@Controller({
  path: 'admin/users',
  version: API_VERSION.V1,
})
@UseGuards(AuthGuard, AdminAuthGuard)
export class AdminUsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  async findAll(@Query() query: any) {
    const [users, count] = await this.userService.findAll(query);
    return successResponse(users, 'Users fetched successfully', {
      totalItems: count,
      totalPage: Math.ceil(count / (query.limit ?? SYSTEM.ITEM_PER_PAGE)),
      page: query.page ? Number(query.page) : 1,
      limit: query.limit ? Number(query.limit) : SYSTEM.ITEM_PER_PAGE,
    });
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const isExistEmail = await this.userService.isExistEmail(
      createUserDto.email,
    );

    if (isExistEmail) {
      throw new BadRequestException('Email đã tồn tại');
    }

    const user = await this.userService.create(createUserDto);

    return successResponse(user, 'User created successfully');
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    // Todo: 1. Kiểm tra id tồn tại không?
    if (!body.email) {
      throw new BadRequestException('Email không được để trống');
    }
    const userFind = await this.userService.findByField('email', body.email);
    if (!userFind) {
      throw new NotFoundException('Tài khoản này không tồn tại!');
    }
    // Todo: 2. Kiểm tra email đã tồn tại không?
    const isExistEmail = await this.userService.isExistEmail(
      body.email,
      Number(id),
    );
    if (isExistEmail) {
      throw new BadRequestException('Email đã tồn tại');
    }
    const user = await this.userService.update(Number(id), body);
    return successResponse(user, 'User updated successfully');
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const user = await this.userService.delete(Number(id));
    return successResponse(user, 'User deleted successfully');
  }
}
