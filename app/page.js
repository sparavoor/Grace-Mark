import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import LoginClient from './LoginClient';

export default async function Home() {
  const session = await getSession();

  if (session) {
    if (session.role === 'ADMIN') {
      redirect('/admin/dashboard');
    } else if (session.role === 'SECTOR') {
      redirect('/sector/dashboard');
    }
  }

  return <LoginClient />;
}
