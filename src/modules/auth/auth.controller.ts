import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Get,
  UseGuards,
  Req,
  NotFoundException,
  GoneException,
  Patch,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { successResponse } from 'src/utils/response';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import RefreshTokenDto from './dto/refresh-token.dto';
import { RequestWithAuth } from 'src/types/RequestWithAuth';
import ForgotPasswordDto from './dto/forgot-password.dto';
import { PasswordTokenService } from './password-token.service';
import { API_VERSION } from 'src/constants/apiVersion';
import ResetPasswordDto from './dto/reset-password.dto';
import ForgotPasswordNotification from 'src/common/notifications/forgot-password.notification';
import RegisterDto from './dto/register.dto';
@Controller({
  path: 'auth',
  version: API_VERSION.V1,
})
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordTokenService: PasswordTokenService,
    private readonly forgotPasswordNotification: ForgotPasswordNotification,
    private readonly resetPasswordNotification: ForgotPasswordNotification,
  ) {}

  @Post('login')
  async login(@Body() { email, password }: LoginDto) {
    const data = await this.authService.login(email, password);

    if (!data) {
      throw new UnauthorizedException('Email or password is incorrect');
    }

    return successResponse(data, 'Login successfully');
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  profile(@Req() req: RequestWithAuth) {
    return successResponse(req.user, 'Get profile successfully');
  }

  @Post('refresh-token')
  async refreshToken(@Body() { refreshToken }: RefreshTokenDto) {
    const data = await this.authService.refreshToken(refreshToken);

    if (!data) {
      throw new UnauthorizedException('Unauthorized');
    }

    return successResponse(data, 'Refresh token successfully');
  }

  @Post('forgot-password')
  async forgotPassword(@Body() { email }: ForgotPasswordDto) {
    const data = await this.authService.forgotPassword(email);

    if (!data) {
      throw new NotFoundException('Email không tồn tại!');
    }

    // Gửi email cho user
    await this.forgotPasswordNotification.send({
      name: data.user.name,
      email,
      token: data.token,
      expire_at: data.expire_at,
    });

    return successResponse(
      {
        otp: data.token,
      },
      'Forgot password successfully!',
    );
  }

  @Post('verify-password-token')
  async verifyPasswordToken(@Body() { token }: { token: string }) {
    const data = await this.passwordTokenService.verifyPasswordToken(token);

    if (!data) {
      // Tài nguyên (token) này đã từng tồn tại, nhưng giờ không còn hợp lệ nữa (đã hết hạn hoặc bị thu hồi).
      throw new GoneException(
        'Thời gian đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu lại liên kết mới!',
      );
    }

    return successResponse(data, 'Reset password successfully!');
  }

  @Patch('reset-password')
  async resetPassword(@Body() payload: ResetPasswordDto) {
    const data = await this.passwordTokenService.updatePassword(payload);

    if (!data) {
      throw new InternalServerErrorException('Reset password failed!');
    }

    // Nếu thành công --> Gọi hàm thu hồi token --> Tăng bảo mật
    await this.passwordTokenService.revokePasswordToken(payload.token);

    // Gửi email cho user
    this.resetPasswordNotification.send(data);

    return successResponse({}, 'Reset password successfully!');
  }

  @Post('register')
  async register(@Body() body: RegisterDto) {
    const result = await this.authService.register(body);
    if ('error' in result && result.error === 'user-exist') {
      throw new ConflictException('Email đã tồn tại');
    }
    return successResponse(result, 'Register successfully');
  }
}
