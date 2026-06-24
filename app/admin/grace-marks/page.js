import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { calculateGraceMarks } from '@/lib/scoring';
import GraceMarksAdminClient from './GraceMarksAdminClient';

export default async function GraceMarksAdminPage() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') redirect('/login');

  const criteria = await prisma.graceMarkCriteria.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const sectors = await prisma.sector.findMany({
    include: {
      units: true,
      reports: { include: { meeting: true } },
      graceMarkSubmissions: {
        include: { criteria: true }
      }
    }
  });

  const activeCounts = {
    shine: criteria.filter(c => c.isActive && c.type === 'SHINE_SECTOR').length,
    unitSahityotsav: criteria.filter(c => c.isActive && c.type === 'UNIT_SAHITYOTSAV').length,
    brightUnitSahityotsav: criteria.filter(c => c.isActive && c.type === 'BRIGHT_UNIT_SAHITYOTSAV').length
  };

  const sectorScores = sectors.map(sector => {
    const scores = calculateGraceMarks(sector, activeCounts);
    return {
      id: sector.id,
      name: sector.name,
      unitsCount: sector.units.length,
      graceMarks: scores.graceMarks,
      graceMarksTotal: scores.graceMarksTotal,
      totalScore: scores.total,
      submissions: sector.graceMarkSubmissions,
      units: sector.units
    };
  });

  return (
    <GraceMarksAdminClient 
      initialCriteria={criteria} 
      sectorScores={sectorScores} 
    />
  );
}
