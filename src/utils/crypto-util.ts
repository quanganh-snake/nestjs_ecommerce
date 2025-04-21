import * as crypto from 'crypto';

export const generateOTP = (length: number = 6): number => {
  return crypto.randomInt(10 ** (length - 1), (10 ** length) - 1);
}

export const generateToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
}
