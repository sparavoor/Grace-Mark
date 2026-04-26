'use client';

import { Users, Network, FileCheck, Trophy, ArrowRight, Activity } from 'lucide-react';
import { FadeInUp, ScaleIn, StaggerContainer } from '@/components/Animate';
import Link from 'next/link';

export default function AdminDashboardContent({ sectors, totalUnits, totalReports, avgScore, sectorScores }) {
  return (
    <div className="space-y-10 pb-10">
      <FadeInUp className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-navy-900 uppercase">
            Division <span className="text-indigo-600">Dashboard</span>
          </h1>
          <p className="text-slate-500 font-normal text-sm md:text-base mt-1">Status of Sectors and Units.</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-[10px] text-navy-900 font-semibold text-xs shadow-sm">
          <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span className="uppercase tracking-[0.2em] font-bold">Portal Status</span>
        </div>
      </FadeInUp>

      {/* KPI Tiles - Elevated & Gradient Accents */}
      <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <ScaleIn className="card-premium group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-brand-light/20 -mr-8 -mt-8 rounded-full" />
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
            <Users className="w-3.5 h-3.5" />
            Total Sectors
          </p>
          <p className="text-4xl font-semibold text-navy-900 leading-none">{sectors.length}</p>
        </ScaleIn>
        <ScaleIn delay={0.1} className="card-premium group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-brand-light/20 -mr-8 -mt-8 rounded-full" />
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
            <Network className="w-3.5 h-3.5" />
            Total Units
          </p>
          <p className="text-4xl font-semibold text-navy-900 leading-none">{totalUnits}</p>
        </ScaleIn>
        <ScaleIn delay={0.2} className="card-premium group relative overflow-hidden border-b-4 border-b-brand-indigo">
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
            <FileCheck className="w-3.5 h-3.5 text-brand-indigo" />
            Reports
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-semibold text-navy-900 leading-none">{totalReports}</p>
            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">Total</span>
          </div>
        </ScaleIn>
        <ScaleIn delay={0.3} className="card-premium group relative overflow-hidden border-b-4 border-b-brand-emerald shadow-emerald-500/10">
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-brand-emerald" />
            Avg. Score
          </p>
          <div className="flex items-baseline gap-1.5 leading-none">
            <p className="text-4xl font-semibold text-brand-indigo leading-none">{avgScore.toFixed(1)}</p>
            <span className="text-xs text-slate-300 font-medium tracking-tighter uppercase">/ 20</span>
          </div>
        </ScaleIn>
      </StaggerContainer>

      <section>
        <FadeInUp delay={0.4} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 mt-12">
          <h2 className="text-2xl font-bold text-navy-900 uppercase flex items-center gap-4 tracking-tight">
            <div className="w-1.5 h-8 gradient-brand rounded-full" />
            Sector Performance
          </h2>
          <span className="px-6 py-2.5 bg-navy-900 text-white rounded-full text-[10px] font-bold uppercase tracking-[0.3em] shadow-xl shadow-navy-900/20">
            Ranking
          </span>
        </FadeInUp>
        
        <StaggerContainer delay={0.5} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {sectorScores.sort((a,b) => b.scores.total - a.scores.total).map((sector, idx) => (
            <ScaleIn key={sector.id} className="card-premium flex flex-col group relative overflow-hidden h-full">
              {/* Rank Badge */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 flex items-center justify-center -mr-12 -mt-12 rounded-full border border-slate-100 group-hover:bg-navy-900 group-hover:text-white transition-all shadow-sm">
                <span className="text-[14px] font-bold pr-8 pt-8 tracking-tighter opacity-40 group-hover:opacity-100 transition-opacity">RANK #{idx + 1}</span>
              </div>

              <div className="mb-10 mr-10 relative z-10">
                <h3 className="text-2xl font-bold text-navy-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight leading-none">{sector.name}</h3>
                <p className="text-[10px] font-medium text-slate-400 mt-2 uppercase tracking-widest">{sector.units.length} Units</p>
              </div>

              <div className="space-y-8 flex-grow relative z-10">
                <div>
                  <div className="flex justify-between text-[11px] font-medium mb-3">
                    <span className="text-slate-400 uppercase tracking-widest">Sector Marks</span>
                    <span className="text-navy-900">{sector.scores.sectorMarks.toFixed(1)} / 10.0</span>
                  </div>
                  <div className="progress-thick">
                    <div 
                      className="progress-bar-fill shadow-sm" 
                      style={{ width: `${sector.scores.sectorPercentage}%` }} 
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-medium mb-3">
                    <span className="text-slate-400 uppercase tracking-widest">Unit Marks</span>
                    <span className="text-navy-900">{sector.scores.unitMarks.toFixed(1)} / 10.0</span>
                  </div>
                  <div className="progress-thick">
                    <div 
                      className="progress-bar-fill opacity-80" 
                      style={{ width: `${sector.scores.unitPercentage}%`, background: 'linear-gradient(90deg, #4F46E5, #1E3A8A)' }} 
                    />
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-slate-50 relative z-10">
                <div className="flex flex-wrap gap-2 mb-8">
                  {sector.units.slice(0, 4).map(unit => {
                    const count = sector.reports.filter(r => r.meeting.targetGroup === 'UNIT' && r.unitId === unit.id).length;
                    return (
                      <div key={unit.id} className="text-[8px] font-medium text-slate-400 uppercase bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        {unit.name.split(' ')[0]}: {count}/5
                      </div>
                    )
                  })}
                  {sector.units.length > 4 && (
                    <div className="text-[8px] font-medium text-slate-300 uppercase px-2 py-1.5">+{sector.units.length - 4} more</div>
                  )}
                </div>
                
                <Link 
                  href={`/admin/sectors/${sector.id}`}
                  className="btn-primary w-full text-[10px] uppercase tracking-[0.3em] py-4 group/btn"
                >
                  View Details <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </ScaleIn>
          ))}
        </StaggerContainer>
      </section>
    </div>
  );
}
