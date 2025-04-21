import { Injectable, NotFoundException } from '@nestjs/common';
import { Brackets, FindOperator, Like, Not, Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import Hashing from 'src/utils/hashing';
import { CreateUserDto } from './dto/create-user.dto';
import UpdateUserDto from './dto/update-user.dto';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async findAll(query: any): Promise<[User[], number]> {
    const {
      page,
      limit,
      sort = 'id',
      order = 'ASC',
      status = '',
      search = '',
      ...where
    } = query;
    const skip = page ? (page - 1) * limit : 0;

    const queryBuilder = this.userRepository
      .createQueryBuilder('users')
      .limit(limit)
      .offset(skip)
      .orderBy(`users.${sort}`, order)
      .select(['users.email', 'users.status', 'users.created_at']);

    if (status === 'active' || status === 'inactive') {
      queryBuilder.andWhere('users.status = :status', { status });
    }

    if (search) {
      // Brackets: là dạng nhóm các điều kiện vào trong 1 nhóm
      // Ta được SQL đầy đủ: SELECT * FROM users WHERE (email LIKE '%search%' OR name LIKE '%search%')
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('users.email LIKE :search', {
            search: `%${search}%`,
          }).orWhere('users.name LIKE :search', { search: `%${search}%` });
        }),
      );
    }

    const dataUsers = await queryBuilder.getMany();
    const totalItems = await queryBuilder.getCount();

    return [dataUsers, totalItems];

    // console.log(dataUsers);
    // let whereOptions: any = {};

    // if (where) {
    //   whereOptions = { ...where };
    // }

    // if (search) {
    //   whereOptions.name = Like(`%${search}%`);
    //   whereOptions.email = Like(`%${search}%`);
    // }

    // return await this.userRepository.findAndCount({
    //   skip,
    //   take: limit,
    //   order: {
    //     [sort]: order,
    //   },
    //   where: whereOptions,
    //   select: {
    //     email: true,
    //   },
    // });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByField(field: string, value: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { [field]: value } });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await Hashing.hashPassword(createUserDto.password);
    // createUserDto.user_type = 'admin';
    if (createUserDto.status === 'active') {
      createUserDto.verify_at = new Date();
    }
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.userRepository.save(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.password) {
      updateUserDto.password = await Hashing.hashPassword(
        updateUserDto.password,
      );
    }

    let userUpdate = {};
    if (updateUserDto.email) {
      userUpdate = { ...userUpdate, email: updateUserDto.email };
    }

    return this.userRepository.save({ ...user, ...userUpdate });
  }

  async delete(id: number): Promise<User> {
    const user = await this.findOne(id);
    await this.userRepository.delete(id);
    return user;
  }

  async isExistEmail(email: string, id?: number): Promise<boolean> {
    const where: {
      email?: string;
      id?: FindOperator<number>;
    } = {
      email,
    };

    if (id) {
      where.id = Not(id);
    }

    const user = await this.userRepository.findOne({ where });
    return !!user;
  }
}
