import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';

export const generateToken = (userId: string, expiresIn: string = '7d'): string => {
  const options: SignOptions = { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] };
  return jwt.sign(
    { id: userId },
    config.jwt.secret,
    options
  );
};

export const verifyToken = (token: string): { id: string } => {
  return jwt.verify(token, config.jwt.secret) as { id: string };
}; 