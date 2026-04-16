import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const SECRET_KEY = process.env.JWT_SECRET || 'supersecretkey-change-in-production';

export async function createSession(user) {
  const token = jwt.sign({ id: user.id, role: user.role, username: user.username }, SECRET_KEY, {
    expiresIn: '7d',
  });
  
  cookies().set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });
}

export async function getSession() {
  const token = cookies().get('session')?.value;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, SECRET_KEY);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function destroySession() {
  cookies().delete('session');
}
