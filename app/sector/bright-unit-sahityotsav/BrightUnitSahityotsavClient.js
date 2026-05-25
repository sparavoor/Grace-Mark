'use client';

import { useState } from 'react';
import { Trophy, Check, ShieldAlert, Award, HelpCircle, Save, CheckCircle2 } from 'lucide-react';
import { FadeInUp, ScaleIn, StaggerContainer } from '@/components/Animate';
import { submitSectorGraceMarks } from '@/app/actions/grace-marks';

export default function BrightUnitSahityotsavClient({ criteria, initialSubmissions, units = [] }) {
  const initialMap = {};
  initialSubmissions.forEach(sub => {
    if (sub.unitId) {
      const key = `${sub.criteriaId}_${sub.unitId}`;
      initialMap[key] = {
        percentage: sub.percentage,
        isTicked: sub.isTicked,
        saved: true
      };
    }
  });

  const [formStates, setFormStates] = useState(() => {
    const states = {};
    criteria.forEach(c => {
      units.forEach(unit => {
        const key = `${c.id}_${unit.id}`;
        const existing = initialMap[key];
        states[key] = {
          percentage: 100,
          isTicked: existing ? existing.isTicked : false,
          saving: false,
          error: '',
          success: ''
        };
      });
    });
    return states;
  });

  function getMarksForPercentage(pct) {
    if (pct >= 100) return 25;
    if (pct >= 80) return 20;
    if (pct >= 60) return 15;
    if (pct >= 40) return 10;
    if (pct >= 20) return 5;
    return 0;
  }

  function calculateCriteriaLiveMarks(criteriaItem) {
    if (units.length === 0) return 0;
    let completedCount = 0;
    units.forEach(unit => {
      const state = formStates[`${criteriaItem.id}_${unit.id}`];
      if (state && state.isTicked) {
        completedCount++;
      }
    });
    const pct = Math.round((completedCount / units.length) * 100);
    return getMarksForPercentage(pct);
  }

  function getCriteriaLivePercentage(criteriaItem) {
    if (units.length === 0) return 0;
    let completedCount = 0;
    units.forEach(unit => {
      const state = formStates[`${criteriaItem.id}_${unit.id}`];
      if (state && state.isTicked) {
        completedCount++;
      }
    });
    return Math.round((completedCount / units.length) * 100);
  }

  async function handleToggleUnit(criteriaId, unitId, checked) {
    const key = `${criteriaId}_${unitId}`;
    updateFormState(key, { isTicked: checked, error: '', success: '', saving: true });

    const result = await submitSectorGraceMarks(criteriaId, 100, checked, unitId);
    
    if (result.error) {
      updateFormState(key, { error: result.error, saving: false, isTicked: !checked });
    } else {
      updateFormState(key, { 
        success: 'Saved!', 
        saving: false 
      });
      setTimeout(() => {
        updateFormState(key, { success: '' });
      }, 2000);
    }
  }

  function updateFormState(key, updates) {
    setFormStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        ...updates
      }
    }));
  }

  const totalLiveMarks = criteria.reduce((sum, c) => {
    return sum + calculateCriteriaLiveMarks(c);
  }, 0);

  return (
    <div className="space-y-10 pb-10">
      <FadeInUp className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-navy-900 uppercase">
            Bright Unit <span className="text-emerald-600 font-bold">Sahityotsav</span>
          </h1>
          <p className="text-slate-500 font-normal text-sm mt-1">Select completed units to earn Bright Unit Sector Grace Marks automatically.</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-navy-900 border border-slate-800 rounded-[10px] text-white font-semibold text-xs shadow-xl shadow-navy-900/20">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="uppercase tracking-[0.2em] font-bold">Estimated Grace Score: {totalLiveMarks.toFixed(1)} / 25.0</span>
        </div>
      </FadeInUp>

      {criteria.length === 0 ? (
        <ScaleIn className="card-premium text-center py-20 border-2 border-dashed border-slate-200">
          <Award className="w-16 h-16 text-slate-300 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-navy-900 uppercase mb-2">No Active Bright Unit Sahityotsav Criteria</h3>
          <p className="text-slate-400 max-w-md mx-auto text-sm">The Division Admin has not enabled any active criteria for Bright Unit Sahityotsav at the moment.</p>
        </ScaleIn>
      ) : (
        <StaggerContainer className="grid grid-cols-1 gap-8">
          {criteria.map((item) => {
            const criteriaLiveMarks = calculateCriteriaLiveMarks(item);
            const livePercentage = getCriteriaLivePercentage(item);

            return (
              <ScaleIn key={item.id} className="card-premium flex flex-col justify-between relative overflow-hidden group w-full">
                <div className="space-y-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-1.5">
                      <h3 className="text-xl font-bold text-navy-900 uppercase tracking-tight leading-none">{item.name}</h3>
                      <span className="text-[9px] px-2.5 py-1 rounded bg-emerald-50 text-emerald-600 font-semibold uppercase tracking-wider border border-emerald-100">
                        Bright Unit Sahityotsav
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="px-4 py-2 bg-emerald-50/50 border border-emerald-100 rounded-lg text-right shrink-0">
                        <span className="text-sm font-bold text-emerald-700 leading-none">{livePercentage}%</span>
                        <span className="text-[10px] text-slate-500 font-medium"> Completed</span>
                      </div>
                      <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-right shrink-0">
                        <span className="text-lg font-bold text-navy-900 leading-none">{criteriaLiveMarks.toFixed(1)}</span>
                        <span className="text-[10px] text-slate-400 font-medium"> / 25.0 Sector Marks</span>
                      </div>
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-slate-400 text-xs leading-relaxed font-normal">{item.description}</p>
                  )}

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                    <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                      Grading Standard
                    </h4>
                    <div className="grid grid-cols-5 gap-1.5 text-center text-[9px] font-semibold text-navy-900 uppercase">
                      <div className="p-1.5 bg-white rounded-lg border border-slate-100">20% Units completed &rarr; 5m</div>
                      <div className="p-1.5 bg-white rounded-lg border border-slate-100">40% Units completed &rarr; 10m</div>
                      <div className="p-1.5 bg-white rounded-lg border border-slate-100">60% Units completed &rarr; 15m</div>
                      <div className="p-1.5 bg-white rounded-lg border border-slate-100">80% Units completed &rarr; 20m</div>
                      <div className="p-1.5 bg-white rounded-lg border border-slate-100">100% Units completed &rarr; 25m</div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">Units Completion Checklist</h4>
                      <span className="text-[10px] text-indigo-600 font-semibold uppercase tracking-wider animate-pulse">Changes auto-save instantly</span>
                    </div>
                    
                    {units.length === 0 ? (
                      <p className="text-slate-400 text-xs italic">No units registered under your sector yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {units.map((unit) => {
                          const stateKey = `${item.id}_${unit.id}`;
                          const state = formStates[stateKey] || { percentage: 100, isTicked: false, saving: false, error: '', success: '' };

                          return (
                            <div 
                              key={unit.id} 
                              className={`p-4 border rounded-2xl transition-all duration-300 flex items-center justify-between gap-4 ${
                                state.isTicked 
                                  ? 'bg-emerald-50/45 border-emerald-100/80 shadow-sm shadow-emerald-50' 
                                  : 'bg-slate-50/40 border-slate-100 hover:border-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input 
                                  type="checkbox" 
                                  id={`tick-${stateKey}`}
                                  checked={state.isTicked}
                                  disabled={state.saving}
                                  onChange={(e) => handleToggleUnit(item.id, unit.id, e.target.checked)}
                                  className="w-5 h-5 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded cursor-pointer disabled:opacity-50"
                                />
                                <label 
                                  htmlFor={`tick-${stateKey}`} 
                                  className={`text-xs font-bold uppercase tracking-tight select-none cursor-pointer ${
                                    state.isTicked ? 'text-navy-900' : 'text-slate-500'
                                  }`}
                                >
                                  {unit.name}
                                </label>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {state.saving && (
                                  <div className="w-3.5 h-3.5 border-2 border-emerald-650 border-t-transparent rounded-full animate-spin" />
                                )}
                                {state.success && (
                                  <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                    {state.success}
                                  </span>
                                )}
                                {state.error && (
                                  <span className="text-[9px] text-rose-600 font-semibold" title={state.error}>
                                    Error
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </ScaleIn>
            );
          })}
        </StaggerContainer>
      )}
    </div>
  );
}
