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

    const result = await submitSectorGraceMarks(criteriaId, checked ? 100 : 0, checked, unitId);
    
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

  async function handleSaveNumericUnit(criteriaId, unitId, value, targetSteps, shineType) {
    const key = `${criteriaId}_${unitId}`;
    const numVal = parseInt(value) || 0;
    const hasTarget = shineType === 'NUMBER' && targetSteps !== null && targetSteps > 0;
    const isTicked = hasTarget ? (numVal >= targetSteps) : (numVal > 0);

    updateFormState(key, { saving: true, error: '', success: '' });

    const result = await submitSectorGraceMarks(criteriaId, numVal, isTicked, unitId);

    if (result.error) {
      updateFormState(key, { error: result.error, saving: false });
    } else {
      updateFormState(key, { 
        percentage: numVal,
        isTicked: isTicked,
        success: 'Saved!', 
        saving: false 
      });
      setTimeout(() => {
        updateFormState(key, { success: '' });
      }, 2000);
    }
  }

  function handleNumberChange(criteriaId, unitId, value) {
    const key = `${criteriaId}_${unitId}`;
    const numVal = value === '' ? '' : parseInt(value) || 0;
    updateFormState(key, { percentage: numVal });
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

  const renderChecklist = (item) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {units.map((unit) => {
          const stateKey = `${item.id}_${unit.id}`;
          const state = formStates[stateKey] || { percentage: 0, isTicked: false, saving: false, error: '', success: '' };
          const isNumeric = item.shineType === 'NUMBER';
          const hasTarget = isNumeric && item.targetSteps !== null && item.targetSteps > 0;
          const targetReached = isNumeric && (hasTarget ? state.percentage >= item.targetSteps : state.percentage > 0);

          return (
            <div 
              key={unit.id} 
              className={`p-4 border rounded-2xl transition-all duration-300 flex flex-col justify-between gap-3 ${
                state.isTicked 
                  ? 'bg-emerald-50/45 border-emerald-100/80 shadow-sm shadow-emerald-50' 
                  : 'bg-slate-50/45 border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {!isNumeric ? (
                    <input 
                      type="checkbox" 
                      id={`tick-${stateKey}`}
                      checked={state.isTicked}
                      disabled={state.saving}
                      onChange={(e) => handleToggleUnit(item.id, unit.id, e.target.checked)}
                      className="w-5 h-5 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded cursor-pointer disabled:opacity-50"
                    />
                  ) : (
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      {state.isTicked ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                      ) : (
                        <HelpCircle className="w-5 h-5 text-slate-300" />
                      )}
                    </div>
                  )}
                  <label 
                    htmlFor={!isNumeric ? `tick-${stateKey}` : undefined} 
                    className={`text-xs font-bold uppercase tracking-tight select-none ${
                      !isNumeric ? 'cursor-pointer' : ''
                    } ${
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
                    <span className="text-[9px] text-rose-600 font-semibold" title={state.error}>
                      Error
                    </span>
                  )}
                </div>
              </div>

              {isNumeric && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="relative flex-grow">
                    <input 
                      type="number"
                      min="0"
                      disabled={state.saving}
                      value={state.percentage}
                      onChange={(e) => handleNumberChange(item.id, unit.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveNumericUnit(item.id, unit.id, state.percentage, item.targetSteps, item.shineType);
                        }
                      }}
                      placeholder="Enter count"
                      className="w-full pl-3 pr-8 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-bold bg-white text-navy-900 disabled:opacity-50"
                    />
                    {hasTarget && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-bold text-slate-400">
                        /{item.targetSteps}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleSaveNumericUnit(item.id, unit.id, state.percentage, item.targetSteps, item.shineType)}
                    disabled={state.saving}
                    className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 shadow-sm border border-indigo-600 transition-colors flex items-center justify-center shrink-0"
                    title="Save value"
                  >
                    <Save className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Calculate total ticked items globally
  let totalTickedCount = 0;
  criteria.forEach(c => {
    units.forEach(unit => {
      const state = formStates[`${c.id}_${unit.id}`];
      if (state && state.isTicked) {
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
        <StaggerContainer className="grid grid-cols-1 gap-8 animate-fade-in">
          {criteria.filter(c => !c.parentId).map((parentItem) => {
            const subItems = criteria.filter(c => c.parentId === parentItem.id);
            let parentCompletedCount = 0;
            units.forEach(unit => {
              const state = formStates[`${parentItem.id}_${unit.id}`];
              if (state && state.isTicked) {
                parentCompletedCount++;
              }
            });
            const parentLivePercentage = getCriteriaLivePercentage(parentItem);

            return (
              <ScaleIn key={parentItem.id} className="card-premium flex flex-col justify-between relative overflow-hidden group w-full space-y-6">
                <div className="space-y-6">
                  {/* Parent Question Header */}
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-1.5">
                      <h3 className="text-xl font-bold text-navy-900 uppercase tracking-tight leading-none">{parentItem.name}</h3>
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-[9px] px-2.5 py-1 rounded bg-emerald-50 text-emerald-600 font-semibold uppercase tracking-wider border border-emerald-100">
                          Bright Unit Sahityotsav
                        </span>
                        {parentItem.shineType === 'NUMBER' && parentItem.targetSteps && (
                          <span className="text-[9px] px-2.5 py-1 rounded bg-amber-50 text-amber-700 font-bold uppercase tracking-wider border border-amber-100 flex items-center gap-1">
                            Goal: {parentItem.targetSteps} Steps
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="px-4 py-2 bg-emerald-50/50 border border-emerald-100 rounded-lg text-right shrink-0">
                        <span className="text-sm font-bold text-emerald-700 leading-none">{parentLivePercentage}%</span>
                        <span className="text-[10px] text-slate-500 font-medium"> Completed</span>
                      </div>
                      <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-right shrink-0">
                        <span className="text-lg font-bold text-navy-900 leading-none">{parentCompletedCount} / {units.length}</span>
                        <span className="text-[10px] text-slate-400 font-medium"> Units Done</span>
                      </div>
                    </div>
                  </div>

                  {parentItem.description && (
                    <p className="text-slate-400 text-xs leading-relaxed font-normal">{parentItem.description}</p>
                  )}

                  {/* Checklist for Parent */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">Parent Checklist</h4>
                      {parentItem.shineType === 'TICK' && (
                        <span className="text-[10px] text-emerald-600 font-medium tracking-tight">Auto-saves instantly</span>
                      )}
                    </div>
                    {renderChecklist(parentItem)}
                  </div>
                </div>

                {/* Nested Sub-questions */}
                {subItems.length > 0 && (
                  <div className="space-y-6 pt-6 border-t border-slate-100/80 bg-slate-50/30 -mx-6 -mb-6 p-6">
                    <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-2">
                      <Award className="w-4 h-4 text-indigo-500" />
                      Nested Sub-Questions
                    </h4>
                    <div className="space-y-6">
                      {subItems.map((subItem) => {
                        let subCompletedCount = 0;
                        units.forEach(unit => {
                          const state = formStates[`${subItem.id}_${unit.id}`];
                          if (state && state.isTicked) {
                            subCompletedCount++;
                          }
                        });

                        return (
                          <div key={subItem.id} className="space-y-4 bg-white p-5 rounded-2xl border border-slate-100/80 shadow-sm transition-all duration-300 hover:border-slate-200">
                            {/* Sub-question Header */}
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                              <div className="space-y-1">
                                <h5 className="text-sm font-bold text-navy-900 uppercase tracking-tight">{subItem.name}</h5>
                                <div className="flex gap-2 items-center flex-wrap pt-0.5">
                                  <span className="text-[8px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-bold uppercase tracking-wider border border-slate-200">
                                    ↳ Sub-Question
                                  </span>
                                  {subItem.shineType === 'NUMBER' && subItem.targetSteps && (
                                    <span className="text-[8px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold uppercase tracking-wider border border-amber-100">
                                      Goal: {subItem.targetSteps} Steps
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{subCompletedCount} / {units.length} Units Met</span>
                              </div>
                            </div>

                            {subItem.description && (
                              <p className="text-slate-400 text-[11px] leading-relaxed font-normal">{subItem.description}</p>
                            )}

                            {/* Sub Checklist */}
                            {renderChecklist(subItem)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </ScaleIn>
            );
          })}
        </StaggerContainer>
      )}
    </div>
  );
}
