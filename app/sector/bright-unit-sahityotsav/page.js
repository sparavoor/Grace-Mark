import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import BrightUnitSahityotsavClient from './BrightUnitSahityotsavClient';

export default async function BrightUnitSahityotsavPage() {
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

  // Fetch only active BRIGHT_UNIT_SAHITYOTSAV criteria
  const activeCriteria = await prisma.graceMarkCriteria.findMany({
    where: { 
      isActive: true,
      type: 'BRIGHT_UNIT_SAHITYOTSAV'
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <BrightUnitSahityotsavClient 
      criteria={activeCriteria} 
      initialSubmissions={sector.graceMarkSubmissions} 
      units={sector.units || []}
    />
  );
}
