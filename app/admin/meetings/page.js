import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import MeetingsClient from './MeetingsClient';

export default async function MeetingsPage() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') redirect('/login');

  const meetings = await prisma.meeting.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const sectors = await prisma.sector.findMany({
    include: { units: true }
  });

  return (
    <MeetingsClient 
      initialMeetings={meetings} 
      sectors={sectors}
    />
  );
}
