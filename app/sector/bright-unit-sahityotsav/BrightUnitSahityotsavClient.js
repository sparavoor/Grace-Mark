'use client';

import { useState } from 'react';
import { Trophy, Check, ShieldAlert, Award, HelpCircle, Save, CheckCircle2, Star, FileText } from 'lucide-react';
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
          percentage: existing ? existing.percentage : (c.shineType === 'NUMBER' ? 0 : 100),
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

  function isUnitCompleted(criteriaItem, unitId) {
    const state = formStates[`${criteriaItem.id}_${unitId}`];
    if (!state || !state.isTicked) return false;
    if (criteriaItem.shineType === 'NUMBER') {
      const target = criteriaItem.targetSteps;
      if (target && target > 0) {
        return state.percentage >= target;
      }
    }
    return true;
  }

  function calculateCriteriaLiveMarks(criteriaItem) {
    if (units.length === 0) return 0;
    let completedCount = 0;
    units.forEach(unit => {
      if (isUnitCompleted(criteriaItem, unit.id)) {
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
      if (isUnitCompleted(criteriaItem, unit.id)) {
        completedCount++;
      }
    });
    return Math.round((completedCount / units.length) * 100);
  }

  async function handleToggleUnit(criteriaId, unitId, checked) {
    const key = `${criteriaId}_${unitId}`;
    const state = formStates[key];
    const crit = criteria.find(c => c.id === criteriaId);
    const defaultPercentage = checked ? (crit?.shineType === 'NUMBER' ? state.percentage : 100) : 0;
    
    updateFormState(key, { isTicked: checked, error: '', success: '', saving: true });

    const result = await submitSectorGraceMarks(criteriaId, defaultPercentage, checked, unitId);
    
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

  async function handleSaveNumberUnit(criteriaId, unitId) {
    const key = `${criteriaId}_${unitId}`;
    const state = formStates[key];
    updateFormState(key, { error: '', success: '', saving: true });

    const result = await submitSectorGraceMarks(criteriaId, state.percentage, state.isTicked, unitId);
    
    if (result.error) {
      updateFormState(key, { error: result.error, saving: false });
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

  // Calculate total ticked items globally
  let totalTickedCount = 0;
  criteria.forEach(c => {
    units.forEach(unit => {
      if (isUnitCompleted(c, unit.id)) {
        totalTickedCount++;
      }
    });
  });
  
  const totalPossibleTicked = criteria.length * units.length;
  const overallPct = totalPossibleTicked > 0 ? Math.round((totalTickedCount / totalPossibleTicked) * 100) : 0;
  const totalLiveMarks = getMarksForPercentage(overallPct);

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
            let completedCount = 0;
            units.forEach(unit => {
              if (isUnitCompleted(item, unit.id)) {
                completedCount++;
              }
            });
            const livePercentage = getCriteriaLivePercentage(item);

            return (
              <ScaleIn key={item.id} className="card-premium flex flex-col justify-between relative overflow-hidden group w-full">
                <div className="space-y-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-1.5">
                      <h3 className="text-xl font-bold text-navy-900 uppercase tracking-tight leading-none">{item.name}</h3>
                      <div className="flex gap-2 items-center flex-wrap pt-1">
                        <span className="text-[9px] px-2.5 py-1 rounded bg-emerald-50 text-emerald-600 font-semibold uppercase tracking-wider border border-emerald-100">
                          Bright Unit Sahityotsav
                        </span>
                        {item.shineType === 'NUMBER' && item.targetSteps && (
                          <span className="text-[9px] px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 font-bold uppercase tracking-wider border border-indigo-100 flex items-center gap-1">
                            <Star className="w-3 h-3 text-indigo-500 fill-indigo-500 shrink-0" />
                            Target: {item.targetSteps} Steps
                          </span>
                        )}
                        {item.shineType === 'TEXT' && (
                          <span className="text-[9px] px-2.5 py-1 rounded bg-sky-50 text-sky-700 font-bold uppercase tracking-wider border border-sky-100 flex items-center gap-1">
                            <FileText className="w-3 h-3 text-sky-500 shrink-0" />
                            Short Answer Mode
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="px-4 py-2 bg-emerald-50/50 border border-emerald-100 rounded-lg text-right shrink-0">
                        <span className="text-sm font-bold text-emerald-700 leading-none">{livePercentage}%</span>
                        <span className="text-[10px] text-slate-500 font-medium"> Completed</span>
                      </div>
                      <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-right shrink-0">
                        <span className="text-lg font-bold text-navy-900 leading-none">{completedCount} / {units.length}</span>
                        <span className="text-[10px] text-slate-400 font-medium"> Units Done</span>
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
                    {item.shineType === 'NUMBER' ? (
                      <p className="text-[10px] font-semibold text-emerald-700 uppercase leading-none">
                        Goal-based unit scoring! For each unit, input a value that meets or exceeds <span className="font-bold text-emerald-800">{item.targetSteps} steps</span> to count that unit as completed. Overall grade score scales by total completed units.
                      </p>
                    ) : (
                      <div className="grid grid-cols-5 gap-1.5 text-center text-[9px] font-semibold text-navy-900 uppercase">
                        <div className="p-1.5 bg-white rounded-lg border border-slate-100">20% Units completed &rarr; 5m</div>
                        <div className="p-1.5 bg-white rounded-lg border border-slate-100">40% Units completed &rarr; 10m</div>
                        <div className="p-1.5 bg-white rounded-lg border border-slate-100">60% Units completed &rarr; 15m</div>
                        <div className="p-1.5 bg-white rounded-lg border border-slate-100">80% Units completed &rarr; 20m</div>
                        <div className="p-1.5 bg-white rounded-lg border border-slate-100">100% Units completed &rarr; 25m</div>
                      </div>
                    )}
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
                          const targetReached = item.shineType === 'NUMBER' && item.targetSteps && state.percentage >= item.targetSteps;

                          return (
                            <div 
                              key={unit.id} 
                              className={`p-4 border rounded-2xl transition-all duration-300 flex flex-col gap-3 justify-between ${
                                state.isTicked 
                                  ? (targetReached || item.shineType !== 'NUMBER' ? 'bg-emerald-50/45 border-emerald-100/80 shadow-sm shadow-emerald-50' : 'bg-rose-50/30 border-rose-100')
                                  : 'bg-slate-50/40 border-slate-100 hover:border-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-4 w-full">
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
                                    <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                                  )}
                                  {state.success && (
                                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest flex items-center gap-1">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                      {state.success}
                                    </span>
                                  )}
                                  {state.error && (
                                    <span className="text-[9px] text-rose-600 font-bold uppercase" title={state.error}>
                                      Error
                                    </span>
                                  )}
                                </div>
                              </div>

                              {state.isTicked && item.shineType === 'NUMBER' && (
                                <div className="flex items-center gap-2 pl-8 animate-fade-in w-full flex-wrap">
                                  <input 
                                    type="number"
                                    min="0"
                                    value={state.percentage}
                                    disabled={state.saving}
                                    onChange={(e) => {
                                      let val = parseInt(e.target.value) || 0;
                                      if (val < 0) val = 0;
                                      updateFormState(stateKey, { percentage: val });
                                    }}
                                    className="w-20 px-2 py-1 text-center font-bold border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-600 bg-white"
                                    placeholder="Value"
                                  />
                                  <button
                                    onClick={() => handleSaveNumberUnit(item.id, unit.id)}
                                    disabled={state.saving}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] uppercase tracking-wider font-bold transition-all flex items-center gap-1 shrink-0 shadow-sm"
                                  >
                                    <Save className="w-3 h-3" /> Save
                                  </button>
                                  {item.targetSteps && (
                                    <span className={`text-[8px] font-bold px-2 py-1 rounded uppercase tracking-wider border ${
                                      targetReached 
                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                        : 'bg-rose-50/70 text-rose-600 border-rose-100/50'
                                    }`}>
                                      {targetReached ? '🏆 Reached' : `Target: ${item.targetSteps}`}
                                    </span>
                                  )}
                                </div>
                              )}
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
