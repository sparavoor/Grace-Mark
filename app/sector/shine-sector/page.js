import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import ShineSectorClient from './ShineSectorClient';

export default async function ShineSectorPage() {
  const session = await getSession();
  if (!session || session.role !== 'SECTOR') redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      sector: {
        include: {
          graceMarkSubmissions: {
            include: { criteria: true }
          }
        }
      }
    }
  });

  if (!user || !user.sector) redirect('/login');
  const sector = user.sector;

  // Fetch only active SHINE_SECTOR criteria
  const activeCriteria = await prisma.graceMarkCriteria.findMany({
    where: { 
      isActive: true,
      type: 'SHINE_SECTOR'
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <ShineSectorClient 
      criteria={activeCriteria} 
      initialSubmissions={sector.graceMarkSubmissions} 
    />
  );
}
