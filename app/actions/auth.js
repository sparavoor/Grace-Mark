'use server';

import { prisma } from '@/lib/prisma';
import { createSession, destroySession } from '@/lib/session';
import bcrypt from 'bcrypt';
import { redirect } from 'next/navigation';

export async function login(formData) {
  const username = formData.get('username');
  const password = formData.get('password');

  if (!username || !password) {
    return { error: 'Username and password are required' };
  }

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return { error: 'Invalid credentials' };
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return { error: 'Invalid credentials' };
  }

  await createSession(user);

  if (user.role === 'ADMIN') {
    redirect('/admin/dashboard');
  } else {
    redirect('/sector/dashboard');
  }
}

export async function logout() {
  await destroySession();
  redirect('/login');
}
