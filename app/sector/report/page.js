import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import ReportClientForm from './ReportClientForm';

export default async function SectorReportPage() {
  const session = await getSession();
  if (!session || session.role !== 'SECTOR') redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { sector: { include: { units: true } } }
  });

  const now = new Date();

  // Find meetings that are active (start < now < end)
  const activeMeetings = await prisma.meeting.findMany({
    where: {
      endDate: { gte: now },
    }
  });

  return <ReportClientForm activeMeetings={activeMeetings} units={user.sector.units} />;
}
