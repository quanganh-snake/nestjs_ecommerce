import { IsEmail, IsIn, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty({
    message: 'Mật khẩu không được để trống',
  })
  @Length(6, 100, {
    message: 'Mật khẩu phải có độ dài từ 6 đến 100 ký tự',
  })
  password: string;

  @IsOptional()
  @IsIn(['active', 'inactive'], {
    message: 'Trạng thái phải là active hoặc inactive',
  })
  status?: string;

  @IsOptional()
  @IsIn(['admin', 'user'], {
    message: 'Loại tài khoản phải là admin hoặc user',
  })
  user_type?: string;

  @IsOptional()
  verify_at?: Date;
}
