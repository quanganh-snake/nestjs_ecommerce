import { IsNotEmpty, IsEmail, IsDefined } from "class-validator";

export default class ForgotPasswordDto {
  @IsDefined({
    message: 'Trường email là bắt buộc!'
  })
  @IsNotEmpty({
    message: 'Email không được để trống!'
  })
  @IsEmail({}, {
    message: 'Email không hợp lệ!'
  })
  email: string;
}
