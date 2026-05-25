import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import GraceMarksSectorClient from './GraceMarksSectorClient';

export default async function SectorGraceMarksPage() {
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

  // Fetch only active grace mark criteria configured by admin
  const activeCriteria = await prisma.graceMarkCriteria.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <GraceMarksSectorClient 
      criteria={activeCriteria} 
      initialSubmissions={sector.graceMarkSubmissions} 
      units={sector.units || []}
    />
  );
}
