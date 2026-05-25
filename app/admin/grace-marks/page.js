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

  const sectorScores = sectors.map(sector => {
    const scores = calculateGraceMarks(sector);
    return {
      id: sector.id,
      name: sector.name,
      unitsCount: sector.units.length,
      graceMarks: scores.graceMarks,
      graceMarksTotal: scores.graceMarksTotal,
      totalScore: scores.total
    };
  });

  return (
    <GraceMarksAdminClient 
      initialCriteria={criteria} 
      sectorScores={sectorScores} 
    />
  );
}
