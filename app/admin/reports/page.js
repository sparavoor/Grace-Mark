import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { FileText, Users, Calendar, ExternalLink, ImageIcon, Target, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { FadeInUp, ScaleIn, StaggerContainer } from '@/components/Animate';

export default async function ReportsPage() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') redirect('/login');

  const reports = await prisma.meetingReport.findMany({
    include: {
      meeting: true,
      sector: true,
      unit: true,
    },
    orderBy: { submittedAt: 'desc' }
  });

  return (
    <div className="space-y-8 md:space-y-12">
      <FadeInUp className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 md:pb-8 border-b border-slate-200/50">
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-slate-900 leading-none">
            Data <span className="text-indigo-600">Verification</span>
          </h1>
          <p className="text-slate-500 mt-2 font-normal text-sm md:text-base">Review and audit all submitted performance reports.</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs md:text-sm shadow-xl shadow-slate-900/10 mx-auto md:mx-0 min-w-[200px] justify-center transition-transform hover:scale-105">
          <ShieldCheck className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform" />
          <span className="tracking-widest">{reports.length} SUBMISSIONS</span>
        </div>
      </FadeInUp>
      
      {/* Desktop View - Premium Table */}
      <FadeInUp delay={0.1} className="hidden lg:block glass-card overflow-hidden p-0 border-slate-100 shadow-2xl">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Metric Entity</th>
                <th className="px-8 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Source Node</th>
                <th className="px-8 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap text-center">Engagement</th>
                <th className="px-8 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap text-center">Lifecycle</th>
                <th className="px-8 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap text-right">Inventory</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {reports.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-8 py-32 text-center font-normal text-slate-400">
                    <div className="flex flex-col items-center gap-6">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                        <FileText className="w-10 h-10 opacity-20" />
                      </div>
                      <span className="text-sm font-medium uppercase tracking-widest">Awaiting sector intelligence stream...</span>
                    </div>
                  </td>
                </tr>
              )}
              {reports.map((r) => (
                <tr key={r.id} className="group hover:bg-indigo-50/30 transition-all duration-300">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-1.5 h-12 rounded-full shadow-sm ${r.meeting.targetGroup === 'SECTOR' ? 'bg-indigo-600' : 'bg-amber-400'}`} />
                      <div>
                        <p className="font-bold text-slate-900 leading-tight tracking-tight text-lg group-hover:text-indigo-600 transition-colors uppercase">{r.meeting.name}</p>
                        <span className={`text-[9px] font-medium uppercase tracking-[0.15em] mt-1 inline-block ${r.meeting.targetGroup === 'SECTOR' ? 'text-indigo-500' : 'text-amber-600'}`}>
                          {r.meeting.targetGroup} Tier
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {r.unit ? (
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900 tracking-tight uppercase text-sm">{r.unit.name}</p>
                        <div className="flex items-center gap-1.5 text-[9px] font-medium text-slate-400 uppercase tracking-widest">
                          <Target className="w-3 h-3 text-indigo-400" />
                          <span>via {r.sector.name}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-xl">
                            <Users className="w-4 h-4 text-indigo-600 shadow-sm" />
                        </div>
                        <span className="font-semibold text-indigo-600 tracking-tight uppercase text-xs">{r.sector.name}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="inline-flex flex-col items-center px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl group-hover:bg-white group-hover:shadow-lg transition-all">
                      <span className="text-lg font-semibold text-slate-900 leading-none">{r.attendanceCount}</span>
                      <span className="text-[8px] font-medium text-slate-400 uppercase mt-1">Personnel</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col items-center gap-1 text-[10px] font-medium text-slate-500 uppercase tracking-tighter">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-300" />
                        {new Date(r.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                      <span className="text-[8px] text-slate-300">{new Date(r.submittedAt).getFullYear()}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3 items-center">
                      <a 
                        href={r.minutesImagePath} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="p-3 bg-slate-900 rounded-2xl text-white hover:bg-indigo-600 hover:shadow-2xl hover:shadow-indigo-600/30 transition-all group/btn"
                        title="View Submission Image"
                      >
                        <ImageIcon className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                      </a>
                      <div className="flex flex-col items-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <a 
                            href={r.minutesImagePath} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-[9px] font-semibold uppercase tracking-[0.2em] text-indigo-600 hover:underline flex items-center gap-1.5"
                        >
                            Audit Evidence <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FadeInUp>

      {/* Mobile/Tablet View - Adaptive Card Stacks */}
      <StaggerContainer className="lg:hidden space-y-4">
        {reports.length === 0 && (
          <FadeInUp className="glass-card flex flex-col items-center justify-center py-24 text-center border-dashed border-slate-200">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <FileText className="w-8 h-8 text-slate-200 opacity-20" />
             </div>
             <p className="text-slate-400 font-normal uppercase tracking-widest text-xs">Awaiting sector intelligence</p>
          </FadeInUp>
        )}
        {reports.map((r, idx) => (
          <ScaleIn key={r.id} delay={idx * 0.05} className="glass-card p-6 md:p-8 border-slate-100 group relative overflow-hidden">
             {/* Card Header */}
             <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-10 rounded-full ${r.meeting.targetGroup === 'SECTOR' ? 'bg-indigo-600' : 'bg-amber-400'}`} />
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight leading-none group-active:text-indigo-600 transition-colors">{r.meeting.name}</h3>
                    <p className={`text-[9px] font-medium uppercase tracking-widest mt-1.5 ${r.meeting.targetGroup === 'SECTOR' ? 'text-indigo-500' : 'text-amber-600'}`}>
                      {r.meeting.targetGroup} Tier Protocol
                    </p>
                  </div>
                </div>
                <a 
                  href={r.minutesImagePath} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="p-4 bg-slate-900 text-white rounded-2xl shadow-lg active:scale-95 transition-transform"
                >
                   <ImageIcon className="w-5 h-5" />
                </a>
             </div>

             {/* Source Entity Info */}
             <div className="p-4 bg-slate-50 rounded-2xl mb-6 flex items-center justify-between border border-slate-100/50">
                <div className="space-y-1">
                   <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Source Node</p>
                   <p className="text-sm font-bold text-slate-900 uppercase tracking-tighter">
                     {r.unit ? r.unit.name : r.sector.name}
                   </p>
                </div>
                {r.unit && (
                  <div className="px-3 py-1 bg-white border border-indigo-100 rounded-lg text-[8px] font-medium text-indigo-500 uppercase tracking-widest">
                    VIA {r.sector.name}
                  </div>
                )}
             </div>

             {/* Metrics Row */}
             <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-3">
                   <div className="p-2.5 bg-indigo-50 rounded-xl">
                      <Users className="w-4 h-4 text-indigo-600" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900 leading-none">{r.attendanceCount}</span>
                      <span className="text-[8px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">Personnel</span>
                   </div>
                </div>
                <div className="flex items-center gap-3 justify-end">
                   <div className="flex flex-col text-right">
                      <span className="text-sm font-semibold text-slate-900 leading-none uppercase">
                        {new Date(r.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-[8px] font-medium text-slate-400 uppercase tracking-widest mt-0.5 whitespace-nowrap">Audit Archive</span>
                   </div>
                   <div className="p-2.5 bg-slate-50 rounded-xl">
                      <Calendar className="w-4 h-4 text-slate-400" />
                   </div>
                </div>
             </div>
          </ScaleIn>
        ))}
      </StaggerContainer>
      
      <FadeInUp delay={0.2} className="flex items-center justify-center gap-3 text-[10px] font-normal text-slate-400 uppercase tracking-[0.3em] pb-10 text-center px-4">
          <div className="w-8 h-[1px] bg-slate-200" />
          System Consistency Verified
          <div className="w-8 h-[1px] bg-slate-200" />
      </FadeInUp>
    </div>
  );
}
