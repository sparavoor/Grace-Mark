import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { calculateGraceMarks } from '@/lib/scoring';
import AdminDashboardContent from './AdminDashboardContent';

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') redirect('/login');

  const sectors = await prisma.sector.findMany({
    include: {
      units: true,
      reports: {
        include: {
          meeting: true
        }
      },
      graceMarkSubmissions: {
        include: { criteria: true }
      }
    }
  });

  const activeCounts = {
    shine: await prisma.graceMarkCriteria.count({ where: { isActive: true, type: 'SHINE_SECTOR' } }),
    unitSahityotsav: await prisma.graceMarkCriteria.count({ where: { isActive: true, type: 'UNIT_SAHITYOTSAV' } }),
    brightUnitSahityotsav: await prisma.graceMarkCriteria.count({ where: { isActive: true, type: 'BRIGHT_UNIT_SAHITYOTSAV' } })
  };

  const sectorScores = sectors.map(s => ({
    ...s,
    scores: calculateGraceMarks(s, activeCounts)
  }));

  const totalUnits = sectors.reduce((acc, s) => acc + s.units.length, 0);
  const totalReports = sectors.reduce((acc, s) => acc + s.reports.length, 0);
  const avgScore = sectorScores.length > 0 
    ? sectorScores.reduce((acc, s) => acc + s.scores.total, 0) / sectorScores.length 
    : 0;

  return (
    <AdminDashboardContent 
      sectors={sectors} 
      totalUnits={totalUnits} 
      totalReports={totalReports} 
      avgScore={avgScore} 
      sectorScores={sectorScores} 
    />
  );
}
