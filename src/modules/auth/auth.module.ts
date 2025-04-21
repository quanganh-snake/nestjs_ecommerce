import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PasswordTokenService } from './password-token.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordToken } from 'src/entities/password_token.entity';
import ForgotPasswordNotification from 'src/common/notifications/forgot-password.notification';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([PasswordToken]),
    JwtModule.register({
    global: true,
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: process.env.JWT_ACT_EXPIRES_IN },
  })
],
  controllers: [AuthController],
  providers: [AuthService, PasswordTokenService, ForgotPasswordNotification],
})
export class AuthModule {}
