import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AuthUser } from '../types/index.js';

export function signToken(user: AuthUser): string {
  return jwt.sign(user, env.jwt.secret, { expiresIn: env.jwt.expiresIn } as any);
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, env.jwt.secret) as AuthUser;
  } catch {
    return null;
  }
}
