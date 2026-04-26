import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { FadeInUp } from '@/components/Animate';
import ReportsClient from './ReportsClient';

export default async function ReportsPage() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') redirect('/login');

  const [reports, sectors, units, meetings] = await Promise.all([
    prisma.meetingReport.findMany({
      include: {
        meeting: true,
        sector: true,
        unit: true,
      },
      orderBy: { submittedAt: 'desc' }
    }),
    prisma.sector.findMany({ orderBy: { name: 'asc' } }),
    prisma.unit.findMany({ orderBy: { name: 'asc' } }),
    prisma.meeting.findMany({ orderBy: { name: 'asc' } })
  ]);

  return (
    <div className="space-y-8 md:space-y-12">
      <FadeInUp className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 md:pb-8 border-b border-slate-200/50">
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-slate-900 leading-none">
            Report <span className="text-indigo-600">List</span>
          </h1>
          <p className="text-slate-500 mt-2 font-normal text-sm md:text-base">Review all submitted meeting reports.</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs md:text-sm shadow-xl shadow-slate-900/10 mx-auto md:mx-0 min-w-[200px] justify-center transition-transform hover:scale-105">
          <ShieldCheck className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform" />
          <span className="tracking-widest">{reports.length} SUBMISSIONS</span>
        </div>
      </FadeInUp>
      
      <ReportsClient 
        initialReports={reports} 
        sectors={sectors} 
        units={units} 
        meetings={meetings} 
      />

      <FadeInUp delay={0.2} className="flex items-center justify-center gap-3 text-[10px] font-normal text-slate-400 uppercase tracking-[0.3em] pb-10 text-center px-4">
          <div className="w-8 h-[1px] bg-slate-200" />
          System Consistency Verified
          <div className="w-8 h-[1px] bg-slate-200" />
      </FadeInUp>
    </div>
  );
}
