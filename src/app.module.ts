import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig, { enumConfigDatabase } from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { MailerModule } from '@nestjs-modules/mailer';
import mailerConfig, { enumConfigMailer } from './config/mailer.config';
import { CustomersModule } from './modules/customers/customers.module';

const APP_CONFIG = 'APP_CONFIG';
type TAppConfig = {
  database: any;
  // redis: {
  //   host: string,
  //   port: number,
  // },
  mailer: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
    secure: boolean;
  };
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [databaseConfig, mailerConfig],
      // validate: validateEnvConfig,
      expandVariables: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [AppModule],
      inject: [APP_CONFIG], // Thay vì inject ConfigService
      useFactory: (appConfig: TAppConfig) => appConfig.database, // Lấy cấu hình từ APP_CONFIG
    }),
    MailerModule.forRootAsync({
      imports: [AppModule],
      inject: [APP_CONFIG],
      useFactory: ({ mailer }: TAppConfig) => {
        const transportMailer = `${mailer.secure ? 'smtps' : 'smtp'}://${mailer.user}:${mailer.pass}@${mailer.host}`;
        return {
          transport: transportMailer,
          defaults: {
            from: '"TBQuangAnh NestJS" <tbquanganh@gmail.com>',
          },
          template: {
            dir: __dirname + '/common/mail/templates',
            adapter: new EjsAdapter({
              inlineCssEnabled: true,
            }),
            options: {
              strict: true,
            },
          },
        };
      },
    }),
    UsersModule,
    AuthModule,
    CustomersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      inject: [ConfigService],
      provide: APP_CONFIG, // Provider tập trung cho tất cả cấu hình
      useFactory: (configService: ConfigService): TAppConfig => {
        return {
          database: configService.get(enumConfigDatabase.db),
          // redis: {
          //   host: configService.get(enumConfigRedis.host),
          //   port: configService.get(enumConfigRedis.port),
          // },
          mailer: {
            host: configService.get(enumConfigMailer.host)!,
            port: configService.get(enumConfigMailer.port)!,
            user: configService.get(enumConfigMailer.user)!,
            pass: configService.get(enumConfigMailer.pass)!,
            from: configService.get(enumConfigMailer.from)!,
            secure: configService.get(enumConfigMailer.secure)!,
          },
        };
      },
    },
  ],
  exports: [APP_CONFIG],
})
export class AppModule {}
