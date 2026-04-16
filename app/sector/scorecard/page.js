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
          reports: { include: { meeting: true } }
        }
      }
    }
  });

  const sector = user.sector;
  const scores = calculateGraceMarks(sector);

  const breakdown = [
    { name: 'Sector Core Meetings', points: 10, current: scores.sectorMarks, color: 'text-indigo-600', iconName: 'Star', status: 'Active' },
    { name: 'Unit Execution Aggregate', points: 10, current: scores.unitMarks, color: 'text-emerald-500', iconName: 'Target', status: 'Active' },
    { name: 'Organizational Audit', points: 25, current: 0, color: 'text-slate-300', iconName: 'ShieldCheck', status: 'Upcoming' },
    { name: 'Program Execution', points: 30, current: 0, color: 'text-slate-300', iconName: 'Zap', status: 'Upcoming' },
    { name: 'Governance Score', points: 20, current: 0, color: 'text-slate-300', iconName: 'Trophy', status: 'Upcoming' },
  ];

  return <ScorecardContent scores={scores} breakdown={breakdown} />;
}
