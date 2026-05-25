import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { calculateGraceMarks } from '@/lib/scoring';
import ScorecardContent from './ScorecardContent';

export default async function ScorecardPage() {
  const session = await getSession();
  if (!session || session.role !== 'SECTOR') redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      sector: {
        include: {
          units: true,
          reports: { include: { meeting: true } },
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

  const breakdown = [
    { name: 'Sector Meetings', points: 10, current: scores.sectorMarks, color: 'text-indigo-600', iconName: 'Star', status: 'Active' },
    { name: 'Unit Meetings', points: 10, current: scores.unitMarks, color: 'text-emerald-500', iconName: 'Target', status: 'Active' },
    { name: 'Organization', points: 25, current: 0, color: 'text-slate-300', iconName: 'ShieldCheck', status: 'Upcoming' },
    { name: 'Programs', points: 30, current: 0, color: 'text-slate-300', iconName: 'Zap', status: 'Upcoming' },
    { name: 'Grace Marks', points: 60, current: scores.graceMarksTotal, color: 'text-amber-500', iconName: 'Trophy', status: 'Active' },
  ];

  return <ScorecardContent scores={scores} breakdown={breakdown} />;
}
