import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import SectorsClient from './SectorsClient';

export default async function SectorsPage() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') redirect('/login');

  const sectors = await prisma.sector.findMany({
    include: {
      user: true,
      _count: {
        select: { units: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <SectorsClient initialSectors={sectors} />
  );
}
