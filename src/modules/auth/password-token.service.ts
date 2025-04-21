import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment-timezone';
import { PasswordToken } from 'src/entities/password_token.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';
import ResetPasswordDto from './dto/reset-password.dto';
import { UsersService } from '../users/users.service';
import Hashing from 'src/utils/hashing';
@Injectable()
export class PasswordTokenService {
  constructor(
    @InjectRepository(PasswordToken)
    private passwordTokenRepository: Repository<PasswordToken>,
    private usersService: UsersService
  ){}

  async createPasswordToken(data: any) {
    return this.passwordTokenRepository.save(data);
  }

  async verifyPasswordToken(token: string) {

    const data = await this.passwordTokenRepository.findOne({
      where: {
        token: token,
        expire_at: MoreThanOrEqual((moment().format('YYYY-MM-DD HH:mm:ss'))),
      },
      relations: {
        user: true
      }
    });
    
    if (!data) {
      return false;
    }

    return data;
    
  }

  async updatePassword({password, token}: ResetPasswordDto) {
    const isTokenValid = await this.verifyPasswordToken(token);

    if (!isTokenValid) {
      return false;
    }

    const hashedPassword = await Hashing.hashPassword(password);

    const userId = isTokenValid.user.id;
    const user = await this.usersService.update(userId, {password: hashedPassword});
    return user;
  }

  async revokePasswordToken(token: string) {
    await this.passwordTokenRepository.delete(token);
  }
}
