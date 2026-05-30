'use client';

import Link from 'next/link';
import { Calendar, Network, LayoutDashboard, Trophy, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import { FadeInUp, ScaleIn, StaggerContainer } from '@/components/Animate';

export default function DashboardContent({ sector, scores }) {
  return (
    <div className="space-y-10 pb-10">
      <FadeInUp className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-navy-900 uppercase leading-none">
            {sector.name} <span className="text-indigo-600">Dashboard</span>
          </h1>
          <p className="text-slate-500 font-normal text-sm md:text-base mt-2">Tracking your progress toward the 20-mark Grace Mark goal.</p>
        </div>
        <Link href="/sector/report" className="btn-primary w-full md:w-auto shadow-indigo-600/30">
          Submit Meeting Report <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </FadeInUp>

      {/* Metric Summary - High Impact KPI Cards */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ScaleIn className="card-premium relative overflow-hidden group border-b-4 border-b-brand-indigo shadow-indigo-500/5">
          <div className="absolute top-0 right-0 w-20 h-20 bg-brand-light/20 -mr-10 -mt-10 rounded-full" />
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.3em] mb-4">TOTAL MARKS</p>
          <div className="flex items-baseline gap-2 leading-none">
            <p className="text-6xl font-semibold text-navy-900 tracking-tighter">{scores.total.toFixed(1)}</p>
            <span className="text-2xl text-slate-300 font-medium tracking-tighter opacity-50">/ 80.0</span>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-50 flex items-center gap-2 text-[9px] font-medium text-emerald-600 uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Marks
          </div>
        </ScaleIn>
        
        <ScaleIn delay={0.05} className="card-premium group relative overflow-hidden">
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-6">SECTOR MARKS</p>
          <div className="flex items-baseline gap-2 leading-none mb-6">
            <p className="text-4xl font-semibold text-navy-900">{scores.sectorMarks.toFixed(1)}</p>
            <span className="text-xs text-slate-400 font-medium tracking-tighter">/ 10.0</span>
          </div>
          <div className="progress-thick">
             <div className="progress-bar-fill" style={{ width: `${scores.sectorPercentage}%` }} />
          </div>
        </ScaleIn>

        <ScaleIn delay={0.1} className="card-premium group relative overflow-hidden">
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-6">UNIT MARKS</p>
          <div className="flex items-baseline gap-2 leading-none mb-6">
            <p className="text-4xl font-semibold text-navy-900">{scores.unitMarks.toFixed(1)}</p>
            <span className="text-xs text-slate-400 font-medium tracking-tighter">/ 10.0</span>
          </div>
          <div className="progress-thick">
             <div className="progress-bar-fill" style={{ width: `${scores.unitPercentage}%`, background: 'linear-gradient(90deg, #4F46E5, #1E3A8A)' }} />
          </div>
        </ScaleIn>

        <ScaleIn delay={0.15} className="card-premium group relative overflow-hidden border-b-4 border-b-amber-500 shadow-amber-500/5">
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-6">GRACE MARKS</p>
          <div className="flex items-baseline gap-2 leading-none mb-6">
            <p className="text-4xl font-semibold text-navy-900">{scores.graceMarksTotal.toFixed(1)}</p>
            <span className="text-xs text-slate-400 font-medium tracking-tighter">/ 60.0</span>
          </div>
          <div className="progress-thick">
             <div className="progress-bar-fill" style={{ width: `${Math.round((scores.graceMarksTotal / 60) * 100)}%`, background: 'linear-gradient(90deg, #F59E0B, #D97706)' }} />
          </div>
        </ScaleIn>
      </StaggerContainer>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        {/* Core Roadmap - Thick Professional Progress */}
        <FadeInUp delay={0.3} className="card-premium">
          <h2 className="text-xl font-bold text-navy-900 mb-12 uppercase flex items-center gap-3 tracking-tight">
            <div className="w-1.5 h-6 gradient-brand rounded-full" />
            Report Progress
          </h2>
          <div className="relative overflow-x-auto no-scrollbar pb-6 px-4">
            <div className="min-w-[500px] relative">
              <div className="absolute top-5 left-0 w-full h-[6px] bg-slate-100 rounded-full -z-10" />
              <div 
                className="absolute top-5 left-0 h-[6px] bg-brand-indigo rounded-full -z-10 transition-all duration-[2000ms] shadow-sm shadow-indigo-300" 
                style={{ width: `${Math.min(scores.sectorPercentage, 100)}%` }} 
              />
              <div className="flex justify-between items-center">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center text-[10px] font-semibold transition-all duration-500 ${
                      i <= sector.reports.filter(r => r.meeting.targetGroup === 'SECTOR').length 
                        ? 'bg-navy-900 border-navy-900 text-white shadow-xl scale-110 -translate-y-1' 
                        : 'bg-white border-slate-100 text-slate-300'
                    }`}>
                      {i}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-12 p-8 bg-navy-900 rounded-[12px] text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <Calendar className="w-16 h-16" />
            </div>
            <div className="flex items-center gap-5 relative z-10">
              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <Activity className="w-6 h-6 text-brand-indigo animate-pulse" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-medium text-brand-indigo uppercase tracking-[0.2em]">Current Analysis</p>
                <p className="text-sm font-bold text-slate-100 uppercase tracking-tight">
                  {Math.max(0, 8 - sector.reports.filter(r => r.meeting.targetGroup === 'SECTOR').length)} Reports remaining for full marks.
                </p>
              </div>
            </div>
          </div>
        </FadeInUp>

        {/* Unit Execution Status */}
        <FadeInUp delay={0.4} className="card-premium">
          <h2 className="text-xl font-bold text-navy-900 mb-10 uppercase flex items-center gap-3 tracking-tight">
            <div className="w-1.5 h-6 bg-brand-emerald rounded-full" />
            Unit Reports
          </h2>
          <div className="space-y-10">
            {sector.units.map(unit => {
              const unitReports = sector.reports.filter(r => r.meeting.targetGroup === 'UNIT' && r.unitId === unit.id).length;
              const unitProgress = Math.min((unitReports / 5) * 100, 100);
              const isComplete = unitReports >= 5;

              return (
                <div key={unit.id} className="group">
                  <div className="flex justify-between items-end mb-4">
                    <div className="space-y-1">
                      <span className="text-sm text-navy-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight font-bold">{unit.name}</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${isComplete ? 'bg-emerald-500 animate-pulse' : 'bg-slate-200'}`} />
                        <span className="text-[9px] text-slate-400 uppercase tracking-widest font-medium">{isComplete ? 'Completed' : 'Pending'}</span>
                      </div>
                    </div>
                    <span className={`text-xl tracking-tighter font-semibold ${isComplete ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {unitReports} <span className="text-[10px] opacity-40 font-medium">/ 5</span>
                    </span>
                  </div>
                  <div className="progress-thick">
                    <div 
                      className={`progress-bar-fill ${isComplete ? 'shadow-sm shadow-emerald-500/20' : 'opacity-40'}`}
                      style={{ width: `${unitProgress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-12 pt-8 border-t border-slate-50 flex items-center gap-3 text-[9px] font-normal text-slate-400 uppercase tracking-widest group">
            <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-brand-light transition-colors">
                <Network className="w-4 h-4 text-brand-indigo" />
            </div>
            <span>Total marks calculated from all units.</span>
          </div>
        </FadeInUp>
      </div>

      {/* Grace Marks Overview - Detailed Breakdown */}
      <FadeInUp delay={0.5} className="card-premium relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
          <Trophy className="w-24 h-24 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-navy-900 uppercase flex items-center gap-3 mb-8 tracking-tight">
          <Trophy className="w-5 h-5 text-amber-500 animate-bounce" />
          Grace Marks Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
          {/* Unit Sahityotsav */}
          <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-white transition-all flex flex-col justify-between group/card shadow-sm">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="font-bold text-navy-900 text-sm uppercase tracking-tight">Unit Sahityotsav</h3>
                <span className={`text-[8px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                  scores.graceMarks.unitSahityotsav.isTicked 
                    ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' 
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}>
                  {scores.graceMarks.unitSahityotsav.isTicked ? 'Active' : 'No Data'}
                </span>
              </div>
              <p className="text-slate-400 text-[10px] leading-relaxed mb-4 font-normal">Proportional scoring from completed Unit Sahityotsav programs.</p>
              {scores.graceMarks.unitSahityotsav.isTicked && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] font-semibold text-slate-500 uppercase tracking-widest leading-none">
                    <span>Progress</span>
                    <span>{scores.graceMarks.unitSahityotsav.percentage}%</span>
                  </div>
                  <div className="progress-thick">
                    <div className="progress-bar-fill bg-indigo-600" style={{ width: `${scores.graceMarks.unitSahityotsav.percentage}%` }} />
                  </div>
                </div>
              )}
            </div>
            <div className="mt-8 flex justify-between items-end border-t border-slate-100/50 pt-4">
              <Link href="/sector/unit-sahityotsav" className="text-[9px] text-indigo-600 hover:text-navy-900 font-bold uppercase tracking-widest flex items-center gap-1">
                View checklist &rarr;
              </Link>
              <span className="text-xl font-bold text-indigo-600 leading-none">
                {scores.graceMarks.unitSahityotsav.marks.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">/ 15.0</span>
              </span>
            </div>
          </div>

          {/* Bright Unit Sahityotsav */}
          <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-emerald-100 hover:bg-white transition-all flex flex-col justify-between group/card shadow-sm">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="font-bold text-navy-900 text-sm uppercase tracking-tight">Bright Unit Sahityotsav</h3>
                <span className={`text-[8px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                  scores.graceMarks.brightUnitSahityotsav.isTicked 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}>
                  {scores.graceMarks.brightUnitSahityotsav.isTicked ? 'Active' : 'No Data'}
                </span>
              </div>
              <p className="text-slate-400 text-[10px] leading-relaxed mb-4 font-normal">Evaluation points mapped from active Bright Unit milestones.</p>
              {scores.graceMarks.brightUnitSahityotsav.isTicked && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] font-semibold text-slate-500 uppercase tracking-widest leading-none">
                    <span>Progress</span>
                    <span>{scores.graceMarks.brightUnitSahityotsav.percentage}%</span>
                  </div>
                  <div className="progress-thick">
                    <div className="progress-bar-fill bg-emerald-500" style={{ width: `${scores.graceMarks.brightUnitSahityotsav.percentage}%` }} />
                  </div>
                </div>
              )}
            </div>
            <div className="mt-8 flex justify-between items-end border-t border-slate-100/50 pt-4">
              <Link href="/sector/bright-unit-sahityotsav" className="text-[9px] text-emerald-600 hover:text-navy-900 font-bold uppercase tracking-widest flex items-center gap-1">
                View checklist &rarr;
              </Link>
              <span className="text-xl font-bold text-emerald-600 leading-none">
                {scores.graceMarks.brightUnitSahityotsav.marks.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">/ 25.0</span>
              </span>
            </div>
          </div>

          {/* Shine Sector */}
          <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-amber-100 hover:bg-white transition-all flex flex-col justify-between group/card shadow-sm">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="font-bold text-navy-900 text-sm uppercase tracking-tight">Shine Sector</h3>
                <span className={`text-[8px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                  scores.graceMarks.shineSector.isTicked 
                    ? 'bg-amber-50 text-amber-600 border border-amber-100' 
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}>
                  {scores.graceMarks.shineSector.isTicked ? 'Active' : 'No Data'}
                </span>
              </div>
              <p className="text-slate-400 text-[10px] leading-relaxed mb-4 font-normal">Checklist target completion rates for overall shine criteria.</p>
              {scores.graceMarks.shineSector.isTicked && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] font-semibold text-slate-500 uppercase tracking-widest leading-none">
                    <span>Progress</span>
                    <span>{scores.graceMarks.shineSector.percentage}%</span>
                  </div>
                  <div className="progress-thick">
                    <div className="progress-bar-fill bg-amber-500" style={{ width: `${scores.graceMarks.shineSector.percentage}%` }} />
                  </div>
                </div>
              )}
            </div>
            <div className="mt-8 flex justify-between items-end border-t border-slate-100/50 pt-4">
              <Link href="/sector/shine-sector" className="text-[9px] text-amber-600 hover:text-navy-900 font-bold uppercase tracking-widest flex items-center gap-1">
                View checklist &rarr;
              </Link>
              <span className="text-xl font-bold text-amber-500 leading-none">
                {scores.graceMarks.shineSector.marks.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">/ 20.0</span>
              </span>
            </div>
          </div>
        </div>
      </FadeInUp>
    </div>
  );
}
