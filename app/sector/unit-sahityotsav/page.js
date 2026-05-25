import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import UnitSahityotsavClient from './UnitSahityotsavClient';

export default async function UnitSahityotsavPage() {
  const session = await getSession();
  if (!session || session.role !== 'SECTOR') redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      sector: {
        include: {
          units: {
            orderBy: { name: 'asc' }
          },
          graceMarkSubmissions: {
            include: { criteria: true }
          }
        }
      }
    }
  });

  if (!user || !user.sector) redirect('/login');
  const sector = user.sector;

  // Fetch only active UNIT_SAHITYOTSAV criteria
  const activeCriteria = await prisma.graceMarkCriteria.findMany({
    where: { 
      isActive: true,
      type: 'UNIT_SAHITYOTSAV'
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <UnitSahityotsavClient 
      criteria={activeCriteria} 
      initialSubmissions={sector.graceMarkSubmissions} 
      units={sector.units || []}
    />
  );
}
