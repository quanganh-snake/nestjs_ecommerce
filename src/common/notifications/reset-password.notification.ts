import { MailerService } from '@nestjs-modules/mailer';
import EmailNotification from './email.notification';
import { Injectable } from '@nestjs/common';
import { omit } from 'lodash';
type TPayloadForgotPassword = {
  token: string;
  email: string;
  expire_at: string;
};

@Injectable()
export default class ResetPasswordNotification extends EmailNotification {
  constructor(protected readonly mailerService: MailerService) {
    super(mailerService);
  }

  subject(context: any): string {
    return `[GenZDev] ${context.name} đặt lại mật khẩu thành công`;
  }
  template(): string {
    return 'reset-password';
  }

  send(data: any) {
    return this.sendMail(data.email, {
      name: data.name,
    });
  }
}
