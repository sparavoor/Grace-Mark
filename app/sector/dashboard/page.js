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
          }
        }
      }
    }
  });

  const sector = user.sector;
  const scores = calculateGraceMarks(sector);

  return <DashboardContent sector={sector} scores={scores} />;
}
