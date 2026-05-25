import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { calculateGraceMarks } from '@/lib/scoring';
import DashboardContent from './DashboardContent';

export default async function SectorDashboard() {
  const session = await getSession();
  if (!session || session.role !== 'SECTOR') redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      sector: {
        include: {
          units: true,
          reports: {
            include: { meeting: true }
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

  const activeShineCriteriaCount = await prisma.graceMarkCriteria.count({
    where: { isActive: true, type: 'SHINE_SECTOR' }
  });

  const scores = calculateGraceMarks(sector, activeShineCriteriaCount);

  return <DashboardContent sector={sector} scores={scores} />;
}
