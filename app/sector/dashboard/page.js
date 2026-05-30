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

  const activeCounts = {
    shine: await prisma.graceMarkCriteria.count({ where: { isActive: true, type: 'SHINE_SECTOR' } }),
    unitSahityotsav: await prisma.graceMarkCriteria.count({ where: { isActive: true, type: 'UNIT_SAHITYOTSAV' } }),
    brightUnitSahityotsav: await prisma.graceMarkCriteria.count({ where: { isActive: true, type: 'BRIGHT_UNIT_SAHITYOTSAV' } })
  };

  const scores = calculateGraceMarks(sector, activeCounts);

  return <DashboardContent sector={sector} scores={scores} />;
}
