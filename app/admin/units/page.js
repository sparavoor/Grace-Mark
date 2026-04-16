import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import UnitsClient from './UnitsClient';

export default async function UnitsPage() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') redirect('/login');

  const units = await prisma.unit.findMany({
    include: {
      sector: true,
      _count: { select: { reports: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const sectors = await prisma.sector.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <UnitsClient initialUnits={units} initialSectors={sectors} />
  );
}
