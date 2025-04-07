// Configuration namespaces
// https://docs.nestjs.com/techniques/configuration#configuration-namespaces

import { registerAs } from "@nestjs/config";
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from "typeorm";
dotenvConfig();
const databaseConfig: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT!) || 5432,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: ['dist/database/entities/*.entity{.ts,.js}',],
  migrations: ['dist/database/migrations/*{.ts,.js}'],
  synchronize: false,
}

export default registerAs('database', () => databaseConfig);

export const dbSourceProvider = new DataSource(databaseConfig)
