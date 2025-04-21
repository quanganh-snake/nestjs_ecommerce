import { config as dotenvConfig } from 'dotenv';
import { registerAs } from "@nestjs/config";
dotenvConfig();

export const enumConfigMailer = {
  prefix: 'mailer',
  host: 'mailer.host',
  port: 'mailer.port',
  user: 'mailer.user',
  pass: 'mailer.pass',
  from: 'mailer.from',
  secure: 'mailer.secure',
} as const

export default registerAs(enumConfigMailer.prefix, () => ({
  host: process.env.MAILER_HOST,
  port: parseInt(process.env.MAILER_PORT!) || 465,
  user: process.env.MAILER_AUTH_USER,
  pass: process.env.MAILER_AUTH_PASS,
  from: process.env.MAILER_FROM,
  secure: process.env.MAILER_SECURE === 'true',
}))