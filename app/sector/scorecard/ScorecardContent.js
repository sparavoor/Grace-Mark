'use client';

import { Trophy, Star, Target, ShieldCheck, Zap, Info, ArrowRight } from 'lucide-react';
import { FadeInUp, ScaleIn, StaggerContainer } from '@/components/Animate';

const iconMap = {
  Star,
  Target,
  ShieldCheck,
  Zap,
  Trophy
};

export default function ScorecardContent({ scores, breakdown }) {
  return (
    <div className="space-y-10 md:space-y-12 pb-10">
      <FadeInUp className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200">
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-navy-900 leading-none uppercase">
            Scorecard <span className="text-brand-indigo font-bold">Audit</span>
          </h1>
          <p className="text-slate-500 mt-2 font-normal text-sm md:text-base">Granular visualization of your {scores.total}/20.0 potential marks.</p>
        </div>
        <div className="flex flex-col items-center md:items-end gap-2 bg-navy-900 px-8 py-6 rounded-[12px] text-white shadow-2xl shadow-navy-900/20 mx-auto md:mx-0 min-w-[260px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
              <Trophy className="w-16 h-16" />
          </div>
          <span className="text-3xl md:text-4xl font-semibold text-brand-indigo tracking-tighter leading-none relative z-10">NET MARK: {scores.total.toFixed(1)}</span>
          <span className="text-slate-400 font-medium uppercase text-[9px] tracking-[0.3em] leading-none mb-1 relative z-10">20.0 Potential Index</span>
        </div>
      </FadeInUp>

      {/* Responsive View - Table (Desktop) / Cards (Mobile) */}
      <div className="animate-fade-in delay-100">
        {/* Desktop Table - Professional Clean Style */}
        <div className="hidden md:block card-premium overflow-hidden p-0 border-slate-100 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-6 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.3em] leading-none">Metric Category</th>
                  <th className="px-8 py-6 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.3em] text-center leading-none">Lifecycle Status</th>
                  <th className="px-8 py-6 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.3em] leading-none">Efficiency Index</th>
                  <th className="px-8 py-6 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.3em] text-right leading-none">Net Reward</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50 font-medium font-sans">
                {breakdown.map((item, i) => {
                  const Icon = iconMap[item.iconName] || Star;
                  const isUnlocked = item.status === 'Active';
                  return (
                    <tr key={i} className="group hover:bg-slate-50 transition-all">
                      <td className="px-8 py-7">
                        <div className="flex items-center gap-6">
                          <div className={`p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm ${isUnlocked ? 'text-brand-indigo' : 'text-slate-200'} group-hover:shadow-md transition-all`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-navy-900 group-hover:text-brand-indigo transition-colors uppercase tracking-tight leading-none">{item.name}</p>
                            <div className="flex items-center gap-1.5 mt-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${isUnlocked ? 'bg-brand-emerald animate-pulse shadow-sm shadow-emerald-400' : 'bg-slate-200'}`} />
                              <p className="text-[9px] text-slate-400 uppercase font-medium tracking-widest">Phase {i + 1} Audit Cycle</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-7 text-center">
                        <span className={`text-[9px] px-3 py-1.5 rounded-lg font-medium uppercase tracking-widest border transition-all ${
                          isUnlocked 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : 'bg-slate-50 text-slate-300 border-slate-100 opacity-60'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-8 py-7">
                        <div className="flex items-center gap-4 w-56">
                          <div className="progress-thick">
                            <div 
                              className={`progress-bar-fill ${isUnlocked ? 'shadow-sm' : 'opacity-20 grayscale'}`}
                              style={{ width: `${(item.current / item.points) * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-semibold text-navy-900 w-10 text-right tracking-tighter">
                            {Math.round((item.current / item.points) * 100)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-7 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`text-2xl font-semibold leading-none ${isUnlocked ? 'text-brand-indigo' : 'text-slate-200'}`}>
                            {item.current.toFixed(1)}
                          </span>
                          <span className="text-[9px] font-medium text-slate-400 uppercase tracking-tighter mt-1">/ {item.points}.0 Marks</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Vertical Cards */}
        <StaggerContainer className="md:hidden space-y-4">
          {breakdown.map((item, i) => {
            const Icon = iconMap[item.iconName] || Star;
            const isUnlocked = item.status === 'Active';
            return (
              <ScaleIn key={i} delay={i * 0.05} className="card-premium p-6 border-slate-100 relative overflow-hidden group">
                 <div className="flex items-start justify-between mb-8">
                    <div className={`p-4 bg-slate-50 rounded-xl ${isUnlocked ? 'text-brand-indigo' : 'text-slate-200'} group-active:scale-95 transition-transform border border-slate-100`}>
                       <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[9px] px-3 py-1.5 rounded-[8px] font-medium uppercase tracking-widest border ${
                      isUnlocked 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-slate-50 text-slate-300 border-slate-100 opacity-40'
                    }`}>
                      {item.status}
                    </span>
                 </div>

                 <h3 className="text-xl font-bold text-navy-900 uppercase tracking-tight mb-2 leading-none">{item.name}</h3>
                 <p className="text-[9px] text-slate-400 uppercase font-medium tracking-[0.2em] mb-8">Phase {i+1} Verification Cycle</p>

                 <div className="space-y-4 pt-8 border-t border-slate-50">
                    <div className="flex justify-between items-center text-[10px] font-medium uppercase tracking-widest text-slate-400">
                        <span>Efficiency Index</span>
                        <span className="text-navy-900 font-semibold">{Math.round((item.current / item.points) * 100)}%</span>
                    </div>
                    <div className="progress-thick">
                      <div 
                        className={`progress-bar-fill ${isUnlocked ? '' : 'opacity-20 grayscale'}`}
                        style={{ width: `${(item.current / item.points) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-end pt-2">
                        <div className="text-[9px] font-medium text-slate-300 uppercase tracking-widest leading-none">Net Reward Status</div>
                        <div className="flex flex-col items-end leading-none translate-y-1">
                            <span className={`text-4xl font-semibold tracking-tighter ${isUnlocked ? 'text-brand-indigo' : 'text-slate-200'}`}>
                              {item.current.toFixed(1)}
                            </span>
                            <span className="text-[8px] font-medium text-slate-400 uppercase opacity-60">/ {item.points}.0 Marks</span>
                        </div>
                    </div>
                 </div>
              </ScaleIn>
            );
          })}
        </StaggerContainer>
      </div>

      {/* Governance Protocol Info - High Impact */}
      <StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
        <ScaleIn className="card-premium bg-navy-900 text-white border-none shadow-2xl shadow-navy-900/40 p-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
            <Info className="w-32 h-32" />
          </div>
          <h3 className="text-2xl font-bold mb-10 flex items-center gap-4 text-brand-indigo uppercase tracking-tight">
            <div className="w-1.5 h-8 gradient-brand rounded-full" />
            Audit <span className="text-white">Protocol</span>
          </h3>
          <div className="space-y-6 relative z-10">
            <div className="p-6 bg-white/5 backdrop-blur-md rounded-[12px] border border-white/5 hover:border-brand-indigo/30 transition-colors">
              <p className="text-[10px] font-semibold text-indigo-300 uppercase tracking-[0.3em] mb-4 bg-navy-950 inline-block px-3 py-1 rounded-lg">Level 1: Core Precision Node</p>
              <p className="text-sm font-normal text-slate-300 leading-loose">Verified completion of 10 high-impact sessions. Distributed linear rewards: 1.0 marks per validated minutes submission stream.</p>
            </div>
            <div className="p-6 bg-white/5 backdrop-blur-md rounded-[12px] border border-white/5 hover:border-brand-indigo/30 transition-colors">
              <p className="text-[10px] font-semibold text-indigo-300 uppercase tracking-[0.3em] mb-4 bg-navy-950 inline-block px-3 py-1 rounded-lg">Level 2: Aggregate Unit Synergy</p>
              <p className="text-sm font-normal text-slate-300 leading-loose">Proportional rewards derived from connected unit efficiency. Peak output requires a consistent 5-report cycle across all primary bases.</p>
            </div>
          </div>
        </ScaleIn>

        <ScaleIn delay={0.2} className="card-premium border-dashed border-2 border-slate-200 flex flex-col items-center justify-center text-center p-14 group hover:border-brand-indigo transition-all hover:bg-slate-50/50">
          <div className="w-24 h-24 bg-brand-light rounded-2xl flex items-center justify-center mb-8 text-brand-indigo shadow-2xl shadow-indigo-100 group-hover:bg-brand-indigo group-hover:text-white transition-all transform group-hover:rotate-6">
            <Trophy className="w-12 h-12" />
          </div>
          <h3 className="text-3xl font-bold text-navy-900 mb-4 tracking-tighter uppercase leading-none">Platinum Governance</h3>
          <p className="text-slate-500 text-sm max-w-xs mx-auto mb-10 font-normal leading-relaxed uppercase tracking-tighter">
            Successfully maintain consistent reporting streams to finalize the "Platinum Governance" certification pipeline.
          </p>
          <button className="btn-primary w-full sm:w-auto px-12 group">
            Export Audit Manifest <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
          </button>
        </ScaleIn>
      </StaggerContainer>
    </div>
  );
}
