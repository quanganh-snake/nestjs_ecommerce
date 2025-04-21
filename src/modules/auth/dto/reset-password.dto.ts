import { IsDefined, IsNotEmpty } from "class-validator";

export default class ResetPasswordDto {
  @IsDefined({
    message: 'Trường password là bắt buộc!'
  })
  @IsNotEmpty({
    message: 'Trường password không được để trống!'
  })
  password: string;
  
  @IsDefined({
    message: 'Trường token là bắt buộc!'
  })
  @IsNotEmpty({
    message: 'Trường token không được để trống!'
  })
  token: string;
} 
