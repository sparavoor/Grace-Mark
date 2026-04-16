'use client';

import { FileText, Calendar, Users, MapPin, CheckCircle2, ImageIcon, Activity, ArrowRight } from 'lucide-react';
import { FadeInUp, ScaleIn, StaggerContainer } from '@/components/Animate';

export default function HistoryContent({ reports, sectorName }) {
  return (
    <div className="space-y-10 pb-10">
      <FadeInUp className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-navy-900 leading-none uppercase">
            Submission <span className="text-brand-indigo font-bold">Archive</span>
          </h1>
          <p className="text-slate-500 mt-2 font-normal text-sm md:text-base">Audit trail of verified performance data for {sectorName}.</p>
        </div>
        <div className="flex items-center gap-4 px-6 py-3.5 bg-white border border-slate-200 rounded-[12px] text-navy-900 font-medium text-xs shadow-sm transition-all hover:shadow-md group">
          <CheckCircle2 className="w-5 h-5 text-brand-emerald" />
          <div className="flex flex-col leading-none">
              <span className="text-lg tracking-tighter font-semibold">{reports.length}</span>
              <span className="text-[8px] text-slate-400 uppercase tracking-widest mt-1">Total Manifests</span>
          </div>
        </div>
      </FadeInUp>

      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {reports.length === 0 && (
          <FadeInUp className="col-span-full py-32 text-center card-premium border-dashed border-slate-200 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-slate-200" />
            </div>
            <p className="text-slate-400 font-normal uppercase tracking-widest text-xs">No entries archived in primary database</p>
          </FadeInUp>
        )}
        {reports.map((report, idx) => (
          <ScaleIn key={report.id} delay={idx * 0.05} className="card-premium flex flex-col group relative overflow-hidden h-full">
            <div className="flex justify-between items-start mb-8 relative z-10">
              <span className={`px-3 py-1.5 rounded-lg text-[9px] font-medium uppercase tracking-[0.2em] border ${
                report.unitId 
                  ? 'bg-amber-50 text-amber-600 border-amber-100' 
                  : 'bg-brand-light text-brand-indigo border-indigo-100'
              }`}>
                {report.unitId ? 'Regional Base' : 'Core Node'} Tier
              </span>
              <span className="text-[10px] font-medium text-slate-300 uppercase tracking-tight opacity-40 group-hover:opacity-100 transition-opacity">ID: {report.id.slice(-6).toUpperCase()}</span>
            </div>

            <div className="mb-8 relative z-10">
                <h3 className="text-2xl font-bold text-navy-900 group-hover:text-brand-indigo transition-colors leading-tight uppercase tracking-tight">
                {report.meeting.name}
                </h3>
                <div className="flex items-center gap-2 mt-3 text-[9px] font-medium text-slate-400 uppercase tracking-widest leading-none">
                    <Activity className="w-3.5 h-3.5 text-brand-emerald animate-pulse" />
                    <span>Audit Verified</span>
                </div>
            </div>

            <div className="space-y-4 mt-auto pt-8 border-t border-slate-50 relative z-10">
              <div className="flex items-center gap-4 text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-none">
                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-brand-light transition-colors">
                  <MapPin className="w-4 h-4 text-slate-300 group-hover:text-brand-indigo transition-colors" />
                </div>
                <span>{report.unitId ? report.unit.name : 'Sector Core Hub'}</span>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-none">
                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-brand-light transition-colors">
                  <Users className="w-4 h-4 text-slate-300 group-hover:text-brand-indigo transition-colors" />
                </div>
                <span>{report.attendanceCount} Active Personnel</span>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-none">
                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-brand-light transition-colors">
                  <Calendar className="w-4 h-4 text-slate-300 group-hover:text-brand-indigo transition-colors" />
                </div>
                <span>{new Date(report.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>

            {report.minutesImagePath && (
              <a 
                href={report.minutesImagePath} 
                target="_blank" 
                rel="noreferrer"
                className="mt-10 flex items-center justify-center gap-3 py-4 bg-navy-900 rounded-[10px] text-[10px] font-semibold uppercase tracking-[0.3em] text-white hover:bg-brand-indigo hover:shadow-2xl hover:shadow-indigo-600/30 transition-all group/btn leading-none"
              >
                Inspect Manifest <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </a>
            )}

            <div className="absolute -right-4 -bottom-4 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity transform group-hover:-rotate-12 duration-700">
                <FileText className="w-32 h-32 text-navy-900" />
            </div>
          </ScaleIn>
        ))}
      </StaggerContainer>
    </div>
  );
}
