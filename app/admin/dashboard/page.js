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
      }
    }
  });

  const sectorScores = sectors.map(s => ({
    ...s,
    scores: calculateGraceMarks(s)
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
