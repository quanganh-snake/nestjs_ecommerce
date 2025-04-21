import { IsNotEmpty, IsString } from "class-validator";

export default class RefreshTokenDto {
  @IsNotEmpty({
    message: 'Refresh token không được để trống!'
  })
  @IsString({
    message: 'Refresh token không hợp lệ!'
  })
  refreshToken: string;
}

