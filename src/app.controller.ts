import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MailerService } from '@nestjs-modules/mailer';
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly mailerService: MailerService
  ) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }
}
