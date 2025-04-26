import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export default class RegisterDto {
  @IsNotEmpty({
    message: 'Vui lòng nhập tên',
  })
  name: string;

  @IsNotEmpty({
    message: 'Email không được để trống',
  })
  @IsEmail(
    {},
    {
      message: 'Email không hợp lệ',
    },
  )
  email: string;

  @IsNotEmpty({
    message: 'Mật khẩu không được để trống',
  })
  @Length(6, 100, {
    message: 'Mật khẩu phải có độ dài từ 6 đến 100 ký tự',
  })
  password: string;

  @IsNotEmpty({
    message: 'Số điện thoại không được để trống',
  })
  phone: string;

  @IsOptional()
  @IsIn(['active', 'inactive'], {
    message: 'Trạng thái phải là active hoặc inactive',
  })
  status?: string;

  @IsOptional()
  verify_at?: Date;
}
