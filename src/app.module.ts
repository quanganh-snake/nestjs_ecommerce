import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { enumConfigDatabase } from './constants/database.const';
import { UsersModule } from './modules/users/users.module';

const APP_CONFIG = 'APP_CONFIG';
type TAppConfig = {
  database: any,
  // redis: {
  //   host: string,
  //   port: number,
  // },
  // mailer: {
  //   host: string,
  //   port: number,
  //   user: string,
  //   pass: string,
  //   from: string,
  //   secure: boolean,
  // }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [databaseConfig,],
      // validate: validateEnvConfig,
      expandVariables: true,
    }),
    TypeOrmModule.forRootAsync(
      {
        imports: [AppModule],
        inject: [APP_CONFIG], // Thay vì inject ConfigService
        useFactory: (appConfig: TAppConfig) => appConfig.database, // Lấy cấu hình từ APP_CONFIG
      }
    ),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      inject: [ConfigService],
      provide: APP_CONFIG, // Provider tập trung cho tất cả cấu hình
      useFactory: (configService: ConfigService): TAppConfig => {
        return ({
          database: configService.get(enumConfigDatabase.db),
          // redis: {
          //   host: configService.get(enumConfigRedis.host),
          //   port: configService.get(enumConfigRedis.port),
          // },
          // mailer: {
          //   host: configService.get(enumConfigMailer.host),
          //   port: configService.get(enumConfigMailer.port),
          //   user: configService.get(enumConfigMailer.user),
          //   pass: configService.get(enumConfigMailer.pass),
          //   from: configService.get(enumConfigMailer.from),
          //   secure: configService.get(enumConfigMailer.secure),
          // }
        })
      },
    },
  ],
  exports: [APP_CONFIG],
})
export class AppModule {}
