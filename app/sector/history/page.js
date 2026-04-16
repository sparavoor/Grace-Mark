import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import HistoryContent from './HistoryContent';

export default async function SectorHistoryPage() {
  const session = await getSession();
  if (!session || session.role !== 'SECTOR') redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      sector: {
        include: {
          reports: {
            include: { 
              meeting: true,
              unit: true
            },
            orderBy: { submittedAt: 'desc' }
          }
        }
      }
    }
  });

  const reports = user.sector.reports;

  return <HistoryContent reports={reports} sectorName={user.sector.name} />;
}
