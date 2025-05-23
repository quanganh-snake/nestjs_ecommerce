import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { AdminUsersController } from './controllers/admin.users.controller';
import { UserController } from './controllers/user.controller';
import { AdminController } from './controllers/admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AdminUsersController, UserController, AdminController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
