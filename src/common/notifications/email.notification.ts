import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

type TPayloadEmail = {
  email: string;
  subject: string;
  template: string;
  context: Record<string, any>;
};

@Injectable()
export default abstract class EmailNotification {
  constructor(protected readonly mailerService: MailerService) {}

  abstract subject(context: any): string; //Định nghĩa subject của notification

  abstract template(): string; //Khai báo tên template của notification

  abstract send(data: any): Promise<any>;

  protected sendMail(to: string, context: any = {}) {
    return this.mailerService.sendMail({
      to,
      subject: this.subject(context),
      template: this.template(),
      context,
    });
  }
}
