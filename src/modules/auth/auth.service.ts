import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import Hashing from '../../utils/hashing';
import { User } from 'src/entities/user.entity';
import { generateOTP } from 'src/utils/crypto-util';
import { PasswordTokenService } from './password-token.service';
import * as moment from 'moment';
import RegisterDto from './dto/register.dto';
import { CustomersService } from '../customers/customers.service';
import { DataSource } from 'typeorm';
import { Customer } from 'src/entities/customer.entity';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private customersService: CustomersService,
    private jwtService: JwtService,
    private passwordTokenService: PasswordTokenService,
    private readonly dataSource: DataSource,
  ) {}

  async login(email: string, password: string): Promise<any> {
    // Todo: Lấy user theo email
    const user = await this.usersService.findByField('email', email);

    if (!user) {
      return null;
    }

    const isPasswordValid = await Hashing.comparePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      return null;
    }

    return this.createToken(user);
  }

  async loginByUser(user: any) {
    return await this.createToken(user);
  }

  async verifyToken(token: string) {
    // Todo: 1. verify token
    const decodedToken = this.decodedToken(token);
    // Todo: 2. lấy user từ token
    if (!decodedToken.id) {
      return false;
    }
    const user = (await this.usersService.findByField(
      'id',
      decodedToken.id,
    )) as User;

    if (!user || user.status !== 'active') {
      return false;
    }

    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  async refreshToken(refreshToken: string) {
    // Todo: 1. verify refresh token
    if (!refreshToken) {
      return false;
    }
    const decodedToken = this.decodedToken(refreshToken);
    // Todo: 2. lấy user từ refresh token
    const user = (await this.usersService.findByField(
      'id',
      decodedToken.id,
    )) as User;

    if (!user) {
      return false;
    }

    // Todo: 3. tạo token mới
    return this.createToken(user);
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByField('email', email);

    if (!user) {
      return false;
    }

    // Todo: 2. tạo password-token
    const otp = generateOTP();
    const expiredAtTimestamp =
      Date.now() + parseInt(process.env.FORGOT_PASSWORD_EXPIRES_IN || '300');

    const passwordToken = await this.passwordTokenService.createPasswordToken({
      user: user,
      token: otp,
      expire_at: new Date(
        moment(expiredAtTimestamp).format('YYYY-MM-DD HH:mm:ss'),
      ),
    });

    return passwordToken;
  }

  // Đăng ký tài khoản - người dùng
  async register(body: RegisterDto) {
    body.status = 'inactive';

    try {
      // 1. Kiểm tra email
      if (await this.usersService.isExistEmail(body.email)) {
        return { error: 'user-exist', message: 'Email đã tồn tại' };
      }

      // Xử lý đăng ký tài khoản
      const user = await this.usersService.create(body);
      if (!user) {
        return {
          error: 'user-create-failed',
          message: 'Đăng ký không thành công',
        };
      }
      // 2. Tạo customer
      const customer = await this.customersService.create({
        user: user,
        name: body.name,
        email: body.email,
        phone: body.phone,
        status: 'inactive',
      });
      if (!customer) {
        return {
          error: 'customer-create-failed',
          message: 'Đăng ký không thành công',
        };
      }
      return {
        user,
        tokens: await this.loginByUser(user),
      };
    } catch (error) {
      return {
        error: 'Exception',
        message: 'Đã có lỗi xảy ra trong quá trình đăng ký',
        originalError: error,
      };
    }
  }

  //
  private createToken(user: any) {
    const payload = {
      id: user.id,
      email: user.email,
      user_type: user.user_type,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: (process.env.JWT_ACT_EXPIRES_IN as string) ?? '1h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN as string) ?? '7d',
    });

    const decodedAccessToken = this.decodedToken(accessToken);
    const accessTokenExpiredAt = decodedAccessToken.exp;

    const decodedRefreshToken = this.decodedToken(refreshToken);
    const refreshTokenExpiredAt = decodedRefreshToken.exp;

    return {
      accessToken,
      accessTokenExpiredAt,
      refreshToken,
      refreshTokenExpiredAt,
    };
  }

  private decodedToken(token: string) {
    return this.jwtService.decode(token);
  }
}
