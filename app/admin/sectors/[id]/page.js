import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { calculateGraceMarks } from '@/lib/scoring';
import { 
  ArrowLeft, 
  MapPin, 
  Layers, 
  FileText, 
  Activity, 
  BarChart3, 
  Trophy,
  LayoutDashboard,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import { FadeInUp, ScaleIn, StaggerContainer } from '@/components/Animate';

export default async function SectorDetailPage({ params }) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') redirect('/login');

  const sector = await prisma.sector.findUnique({
    where: { id: params.id },
    include: {
      units: {
        include: {
          _count: { select: { reports: true } }
        }
      },
      reports: {
        include: { meeting: true, unit: true },
        orderBy: { submittedAt: 'desc' }
      }
    }
  });

  if (!sector) redirect('/admin/sectors');

  const scores = calculateGraceMarks(sector);

  return (
    <div className="space-y-10 md:space-y-16">
      <FadeInUp className="flex flex-col gap-6 md:gap-10">
        <Link 
          href="/admin/sectors" 
          className="inline-flex items-center gap-2.5 text-[10px] font-medium text-slate-400 uppercase tracking-[0.3em] hover:text-indigo-600 transition-all group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1.5 transition-transform" />
          Admin Home
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                <div className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-[9px] font-medium text-indigo-600 uppercase tracking-widest shadow-sm">
                    ID: {params.id.slice(-6).toUpperCase()}
                </div>
                <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-slate-900 leading-[0.9] uppercase">{sector.name}</h1>
            <p className="text-slate-500 mt-6 font-normal text-base md:text-lg max-w-xl mx-auto md:mx-0 leading-relaxed uppercase tracking-tight">Sector Details and Marks Overview</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex flex-col items-center justify-center w-full sm:w-48 py-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl shadow-slate-900/30 group hover:scale-105 transition-transform">
              <p className="text-[9px] font-medium uppercase text-indigo-400 tracking-[0.3em] mb-3 opacity-80">Progress</p>
              <p className="text-4xl md:text-5xl font-semibold leading-none">{((scores.total / 20) * 100).toFixed(0)}%</p>
            </div>
            <div className="flex flex-col items-center justify-center w-full sm:w-48 py-8 glass-card border-indigo-100 rounded-[2.5rem] shadow-xl group hover:scale-105 transition-transform">
              <p className="text-[9px] font-medium uppercase text-slate-400 tracking-[0.3em] mb-3 opacity-80">Total Marks</p>
              <div className="flex items-baseline justify-center gap-1.5 leading-none">
                  <p className="text-4xl md:text-5xl font-semibold text-indigo-600 leading-none">{scores.total.toFixed(1)}</p>
                  <span className="text-[10px] text-slate-300 font-medium tracking-tighter uppercase">/ 20.0</span>
              </div>
            </div>
          </div>
        </div>
      </FadeInUp>

      {/* Stats Grid - Optimized for all screens */}
      <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        <ScaleIn className="glass-card hover:border-indigo-300 transition-all border-slate-100 p-6 md:p-8">
          <p className="text-[9px] md:text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-4">Total Units</p>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-2xl md:rounded-3xl">
                <Layers className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
            </div>
            <p className="text-2xl md:text-4xl font-semibold text-slate-900 tracking-tighter leading-none">{sector.units.length}</p>
          </div>
        </ScaleIn>
        <ScaleIn delay={0.1} className="glass-card hover:border-indigo-300 transition-all border-slate-100 p-6 md:p-8">
          <p className="text-[9px] md:text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-4">Sector Reports</p>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-2xl md:rounded-3xl">
                <Activity className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
            </div>
            <p className="text-2xl md:text-4xl font-semibold text-slate-900 tracking-tighter leading-none">{sector.reports.filter(r => !r.unitId).length}</p>
          </div>
        </ScaleIn>
        <ScaleIn delay={0.2} className="glass-card hover:border-indigo-300 transition-all border-slate-100 p-6 md:p-8">
          <p className="text-[9px] md:text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-4">Unit Reports</p>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-2xl md:rounded-3xl">
                <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
            </div>
            <p className="text-2xl md:text-4xl font-semibold text-slate-900 tracking-tighter leading-none">{sector.reports.filter(r => r.unitId).length}</p>
          </div>
        </ScaleIn>
        <ScaleIn delay={0.3} className="glass-card hover:border-indigo-300 transition-all border-slate-100 p-6 md:p-8">
          <p className="text-[9px] md:text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-4">Status</p>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-2xl md:rounded-3xl shadow-lg">
                <Trophy className="w-5 h-5 md:w-6 md:h-6 text-indigo-400" />
            </div>
            <p className="text-2xl md:text-4xl font-semibold text-slate-900 tracking-tighter leading-none">ACTIVE</p>
          </div>
        </ScaleIn>
      </StaggerContainer>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        {/* Unit Performance Breakdown */}
        <div className="lg:col-span-4 space-y-8">
          <FadeInUp className="glass-card border-indigo-100 border shadow-2xl shadow-indigo-100/20 p-8 md:p-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-10 flex items-center gap-3 tracking-tight">
              <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
              UNIT REPORTS
            </h2>
            <div className="space-y-10">
              {sector.units.map((unit, idx) => {
                const count = unit._count.reports;
                const progress = Math.min((count / 5) * 100, 100);
                return (
                  <ScaleIn key={unit.id} delay={idx * 0.05} className="group">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold text-slate-900 tracking-[0.05em] uppercase group-hover:text-indigo-600 transition-colors leading-none">{unit.name}</span>
                      </div>
                      <span className="text-[9px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded leading-none">{count}/5 Reports</span>
                    </div>
                    <div className="h-3.5 bg-slate-50 border border-slate-100 rounded-full overflow-hidden p-0.5 shadow-inner">
                      <div 
                        className={`h-full rounded-full transition-all duration-[2000ms] ${progress >= 100 ? 'bg-emerald-500 shadow-sm shadow-emerald-200' : 'bg-indigo-600 shadow-sm shadow-indigo-100'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </ScaleIn>
                );
              })}
            </div>
            
            {sector.units.length === 0 && (
                <div className="py-16 text-center space-y-4">
                    <ShieldAlert className="w-12 h-12 text-slate-100 mx-auto" />
                    <p className="text-[10px] font-normal text-slate-300 uppercase tracking-widest">No units registered for this sector</p>
                </div>
            )}
          </FadeInUp>

          <FadeInUp delay={0.4} className="glass-card bg-slate-900 text-white border-none shadow-2xl shadow-slate-900/40 p-10 relative overflow-hidden group hidden md:block">
             <LayoutDashboard className="absolute -right-6 -top-6 w-32 h-32 text-indigo-500 opacity-5 group-hover:opacity-10 transition-opacity" />
             <h3 className="text-xl font-bold mb-6 text-indigo-400 tracking-tight flex items-center gap-2 uppercase">
                <Activity className="w-5 h-5" />
                Calculation Details
             </h3>
             <p className="text-xs text-slate-400 leading-relaxed font-normal uppercase tracking-tight">
               Sector Marks: Max 10 (Scaled by 8 meetings). <br />
               Unit Marks: Max 10 (Scaled by the total number of units in this sector, requiring 5 meetings each).
             </p>
             <div className="mt-10 pt-8 border-t border-white/5 flex justify-between items-center">
                 <span className="text-[9px] font-normal text-slate-600 uppercase tracking-widest">V 3.1.2 FINAL</span>
                 <div className="flex gap-2 font-medium text-[9px] text-indigo-500 uppercase">
                     LIVE SYSTEM <Activity className="w-2.5 h-2.5 animate-pulse" />
                 </div>
             </div>
          </FadeInUp>
        </div>

        {/* Audit Trail (Recent Reports) - Responsive Version */}
        <div className="lg:col-span-8">
          <FadeInUp delay={0.2} className="glass-card p-0 overflow-hidden border-slate-100 shadow-2xl">
            <div className="px-6 md:px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-3 tracking-tighter uppercase whitespace-nowrap">
                <FileText className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
                REPORT HISTORY
              </h2>
              <span className="text-[8px] md:text-[10px] font-medium text-indigo-600 uppercase tracking-[0.2em] bg-white px-3 md:px-5 py-2 rounded-full border border-indigo-100 shadow-sm leading-none whitespace-nowrap">
                REAL-TIME
              </span>
            </div>
            
            {/* Desktop View (lg) */}
            <div className="hidden lg:block overflow-x-auto no-scrollbar">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-10 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">Meeting Name</th>
                    <th className="px-10 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] text-center">Source</th>
                    <th className="px-10 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] text-center whitespace-nowrap">Attendance</th>
                    <th className="px-10 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] text-right">Photo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50">
                  {sector.reports.map((report) => (
                    <tr key={report.id} className="group hover:bg-indigo-50/30 transition-all">
                      <td className="px-10 py-7">
                        <p className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight uppercase leading-none">{report.meeting.name}</p>
                        <p className="text-[9px] font-normal text-slate-300 uppercase mt-2.5 tracking-tighter">
                          SUBMITTED ON: {new Date(report.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </td>
                      <td className="px-10 py-7 text-center">
                        <span className={`px-3 py-1.5 rounded-xl text-[9px] font-medium uppercase tracking-widest border shadow-sm ${
                          report.unitId 
                            ? 'bg-amber-50 text-amber-600 border-amber-100' 
                            : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                        }`}>
                          {report.unitId ? report.unit.name : 'Sector Office'}
                        </span>
                      </td>
                      <td className="px-10 py-7 text-center">
                        <div className="inline-flex flex-col items-center px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl group-hover:bg-white group-hover:shadow-md transition-all">
                            <span className="text-sm font-semibold text-slate-900 leading-none">{report.attendanceCount}</span>
                            <span className="text-[7px] font-medium text-slate-400 uppercase mt-1">Attendance</span>
                        </div>
                      </td>
                      <td className="px-10 py-7 text-right">
                        {report.minutesImagePath && (
                          <a 
                            href={report.minutesImagePath} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-2.5 py-3.5 px-6 bg-slate-900 rounded-[1.25rem] text-[9px] font-semibold uppercase text-white hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-600/20 transition-all leading-none"
                          >
                            View Photo <ChevronRight className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet View (<lg) */}
            <div className="lg:hidden p-4 space-y-4">
               {sector.reports.map((report, idx) => (
                 <ScaleIn key={report.id} delay={idx * 0.05} className="bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100 relative group overflow-hidden active:bg-indigo-50/30 transition-colors">
                    <div className="flex justify-between items-start mb-6">
                        <div className="space-y-2">
                           <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight group-active:text-indigo-600 transition-colors leading-none">{report.meeting.name}</h3>
                           <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">
                             {new Date(report.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                           </p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-medium uppercase tracking-widest border shadow-sm ${
                          report.unitId ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                        }`}>
                          {report.unitId ? 'UNIT' : 'CORE'}
                        </span>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-200/40">
                        <div className="flex items-center gap-3">
                           <div className="p-2.5 bg-white rounded-xl shadow-sm">
                              <Activity className="w-4 h-4 text-indigo-500" />
                           </div>
                           <div className="flex flex-col leading-none">
                              <span className="text-lg font-semibold text-slate-900 leading-none">{report.attendanceCount}</span>
                              <span className="text-[8px] font-medium text-slate-400 uppercase tracking-widest mt-1">Attendance</span>
                           </div>
                        </div>
                        {report.minutesImagePath && (
                          <a 
                            href={report.minutesImagePath} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-4 bg-slate-900 text-white rounded-[1.25rem] shadow-lg active:scale-95 transition-transform"
                          >
                             <ImageIcon className="w-5 h-5" />
                          </a>
                        )}
                    </div>
                    {report.unitId && (
                       <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-active:opacity-[0.08] transition-opacity">
                          <MapPin className="w-24 h-24" />
                       </div>
                    )}
                 </ScaleIn>
               ))}
            </div>

            {sector.reports.length === 0 && (
              <div className="py-32 text-center">
                <p className="text-xs font-normal text-slate-200 uppercase tracking-[0.3em] border border-slate-50 inline-block px-10 py-5 rounded-[2rem]">No reports found</p>
              </div>
            )}
          </FadeInUp>
        </div>
      </div>
    </div>
  );
}
