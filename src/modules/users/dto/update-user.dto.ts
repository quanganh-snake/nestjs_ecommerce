import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsDefined, IsEmail, IsNotEmpty } from 'class-validator';
export default class UpdateUserDto extends PartialType(CreateUserDto) {
  // @IsDefined({
  //   message: 'Email không được để trống',
  // })
  // @IsEmail({}, { message: 'Email không hợp lệ' })
  // @IsNotEmpty({ message: 'Email không được để trống' })
  // email: string;
}
