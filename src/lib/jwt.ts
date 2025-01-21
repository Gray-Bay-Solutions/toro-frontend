// src/lib/jwt.ts
import jwt from 'jsonwebtoken';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';

export const createToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};

export async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}