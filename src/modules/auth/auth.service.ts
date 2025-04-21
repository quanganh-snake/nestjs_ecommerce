import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import Hashing from '../../utils/hashing';
import { User } from 'src/entities/user.entity';
import { generateOTP } from 'src/utils/crypto-util';
import { PasswordTokenService } from './password-token.service';
import * as moment from 'moment';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private passwordTokenService: PasswordTokenService
  ) {}

  async login(email: string, password: string): Promise<any> {
    // Todo: Lấy user theo email
    const user = await this.usersService.findByField('email', email);

    if (!user) {
      return null
    }

    const isPasswordValid = await Hashing.comparePassword(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return this.createToken(user);
  }

  async verifyToken (token: string){
    // Todo: 1. verify token
    const decodedToken = this.decodedToken(token);
    // Todo: 2. lấy user từ token
    if(!decodedToken.id) {
      return false
    }
    const user = await this.usersService.findByField('id', decodedToken.id) as User;

    if (!user || user.status!=='active' ) {
      return false;
    }

    const {password, ...userWithoutPassword} = user;

    return userWithoutPassword;
  }

  async refreshToken(refreshToken: string) {
    // Todo: 1. verify refresh token
    if(!refreshToken) {
      return false;
    }
    const decodedToken = this.decodedToken(refreshToken);
    // Todo: 2. lấy user từ refresh token
    const user = await this.usersService.findByField('id', decodedToken.id) as User;

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
    const expiredAtTimestamp = Date.now() + parseInt(process.env.FORGOT_PASSWORD_EXPIRES_IN || '300');

    const passwordToken = await this.passwordTokenService.createPasswordToken({
      user: user,
      token: otp,
      expire_at: new Date(moment(expiredAtTimestamp).format('YYYY-MM-DD HH:mm:ss')),
    });

    return passwordToken;
  }
  private createToken(user: any) {

    const payload = {
      id: user.id,
      email: user.email,
    }

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_ACT_EXPIRES_IN as string ?? '1h',
    })

    const refreshToken = this.jwtService.sign(payload,  {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as string ?? '7d',
    })

    const decodedAccessToken = this.decodedToken(accessToken);
    const accessTokenExpiredAt = decodedAccessToken.exp;

    const decodedRefreshToken = this.decodedToken(refreshToken);
    const refreshTokenExpiredAt = decodedRefreshToken.exp;
    
    return {
      accessToken,
      accessTokenExpiredAt,
      refreshToken,
      refreshTokenExpiredAt,
    }
  }

  private decodedToken(token: string) {
    return this.jwtService.decode(token);
  }
}
