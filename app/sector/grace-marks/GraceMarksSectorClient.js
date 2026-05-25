'use client';

import { useState } from 'react';
import { Trophy, Check, ShieldAlert, Award, ArrowRight, HelpCircle, Save, CheckCircle2 } from 'lucide-react';
import { FadeInUp, ScaleIn, StaggerContainer } from '@/components/Animate';
import { submitSectorGraceMarks } from '@/app/actions/grace-marks';

export default function GraceMarksSectorClient({ criteria, initialSubmissions, units = [] }) {
  // Map submissions by criteriaId and optional unitId
  const initialMap = {};
  initialSubmissions.forEach(sub => {
    const key = sub.unitId ? `${sub.criteriaId}_${sub.unitId}` : `${sub.criteriaId}_sector`;
    initialMap[key] = {
      percentage: sub.percentage,
      isTicked: sub.isTicked,
      saved: true
    };
  });

  // State for form values
  const [formStates, setFormStates] = useState(() => {
    const states = {};
    criteria.forEach(c => {
      const isUnitLevel = c.type === 'UNIT_SAHITYOTSAV' || c.type === 'BRIGHT_UNIT_SAHITYOTSAV';
      if (isUnitLevel) {
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
      } else {
        const key = `${c.id}_sector`;
        const existing = initialMap[key];
        states[key] = {
          percentage: existing ? existing.percentage : 0,
          isTicked: existing ? existing.isTicked : false,
          saving: false,
          error: '',
          success: ''
        };
      }
    });
    return states;
  });

  function getMarksForPercentage(type, percentage) {
    const pct = parseFloat(percentage) || 0;
    
    if (type === 'UNIT_SAHITYOTSAV') {
      if (pct >= 100) return 15;
      if (pct >= 90) return 12;
      if (pct >= 80) return 8;
      if (pct >= 70) return 5;
      return 0;
    }
    
    if (type === 'BRIGHT_UNIT_SAHITYOTSAV') {
      if (pct >= 100) return 25;
      if (pct >= 80) return 20;
      if (pct >= 60) return 15;
      if (pct >= 40) return 10;
      if (pct >= 20) return 5;
      return 0;
    }
    
    if (type === 'SHINE_SECTOR') {
      return parseFloat(((pct / 100) * 20).toFixed(2));
    }
    
    return 0;
  }

  function calculateCriteriaLiveMarks(criteriaItem) {
    const isUnitLevel = criteriaItem.type === 'UNIT_SAHITYOTSAV' || criteriaItem.type === 'BRIGHT_UNIT_SAHITYOTSAV';
    if (isUnitLevel) {
      if (units.length === 0) return 0;
      let completedCount = 0;
      units.forEach(unit => {
        const state = formStates[`${criteriaItem.id}_${unit.id}`];
        if (state && state.isTicked) {
          completedCount++;
        }
      });
      const pct = Math.round((completedCount / units.length) * 100);
      return getMarksForPercentage(criteriaItem.type, pct);
    } else {
      const state = formStates[`${criteriaItem.id}_sector`];
      if (state && state.isTicked) {
        return getMarksForPercentage(criteriaItem.type, state.percentage);
      }
      return 0;
    }
  }

  function getCriteriaLivePercentage(criteriaItem) {
    const isUnitLevel = criteriaItem.type === 'UNIT_SAHITYOTSAV' || criteriaItem.type === 'BRIGHT_UNIT_SAHITYOTSAV';
    if (isUnitLevel) {
      if (units.length === 0) return 0;
      let completedCount = 0;
      units.forEach(unit => {
        const state = formStates[`${criteriaItem.id}_${unit.id}`];
        if (state && state.isTicked) {
          completedCount++;
        }
      });
      return Math.round((completedCount / units.length) * 100);
    } else {
      const state = formStates[`${criteriaItem.id}_sector`];
      return state ? state.percentage : 0;
    }
  }

  const typeLabels = {
    UNIT_SAHITYOTSAV: 'Unit Sahityotsav',
    BRIGHT_UNIT_SAHITYOTSAV: 'Bright Unit Sahityotsav',
    SHINE_SECTOR: 'Shine Sector'
  };

  const typeMaxMarks = {
    UNIT_SAHITYOTSAV: 15,
    BRIGHT_UNIT_SAHITYOTSAV: 25,
    SHINE_SECTOR: 20
  };

  async function handleToggleUnit(criteriaId, type, unitId, checked) {
    const key = `${criteriaId}_${unitId}`;
    
    // Optimistically update & set saving state
    updateFormState(key, { isTicked: checked, error: '', success: '', saving: true });

    const result = await submitSectorGraceMarks(criteriaId, 100, checked, unitId);
    
    if (result.error) {
      // Revert on error
      updateFormState(key, { error: result.error, saving: false, isTicked: !checked });
    } else {
      updateFormState(key, { 
        success: 'Saved!', 
        saving: false 
      });
      // Clear success label after 2 seconds
      setTimeout(() => {
        updateFormState(key, { success: '' });
      }, 2000);
    }
  }

  async function handleSaveSector(criteriaId, type) {
    const key = `${criteriaId}_sector`;
    const state = formStates[key];
    
    updateFormState(key, { error: '', success: '', saving: true });

    const result = await submitSectorGraceMarks(criteriaId, state.percentage, state.isTicked, null);
    
    if (result.error) {
      updateFormState(key, { error: result.error, saving: false });
    } else {
      updateFormState(key, { 
        success: `Successfully updated!`, 
        saving: false 
      });
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

  // Calculate live cumulative total grace marks for the sector
  const totalLiveMarks = criteria.reduce((sum, c) => {
    return sum + calculateCriteriaLiveMarks(c);
  }, 0);

  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <FadeInUp className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-navy-900 uppercase">
            Grace Marks <span className="text-indigo-600 font-bold">Checklist</span>
          </h1>
          <p className="text-slate-500 font-normal text-sm mt-1">Check completed Unit Programs. Marks are auto-calculated for the Sector.</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-navy-900 border border-slate-800 rounded-[10px] text-white font-semibold text-xs shadow-xl shadow-navy-900/20">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="uppercase tracking-[0.2em] font-bold">Live Sector Grace Score: {totalLiveMarks.toFixed(1)} / 60.0</span>
        </div>
      </FadeInUp>

      {criteria.length === 0 ? (
        <ScaleIn className="card-premium text-center py-20 border-2 border-dashed border-slate-200">
          <Award className="w-16 h-16 text-slate-300 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-navy-900 uppercase mb-2">No Active Grace Criteria</h3>
          <p className="text-slate-400 max-w-md mx-auto text-sm">The Division Admin has not enabled any active grace marks criteria at the moment. Please check back later!</p>
        </ScaleIn>
      ) : (
        <StaggerContainer className="grid grid-cols-1 gap-8">
          {criteria.map((item) => {
            const isUnitLevel = item.type === 'UNIT_SAHITYOTSAV' || item.type === 'BRIGHT_UNIT_SAHITYOTSAV';
            const criteriaLiveMarks = calculateCriteriaLiveMarks(item);
            const livePercentage = getCriteriaLivePercentage(item);

            return (
              <ScaleIn key={item.id} className="card-premium flex flex-col justify-between relative overflow-hidden group w-full">
                <div className="space-y-6">
                  {/* Title & Type Badge */}
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-1.5">
                      <h3 className="text-xl font-bold text-navy-900 uppercase tracking-tight leading-none">{item.name}</h3>
                      <span className="text-[9px] px-2.5 py-1 rounded bg-indigo-50 text-indigo-600 font-semibold uppercase tracking-wider border border-indigo-100">
                        {typeLabels[item.type]}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="px-4 py-2 bg-indigo-50/50 border border-indigo-100 rounded-lg text-right shrink-0">
                        <span className="text-sm font-bold text-indigo-700 leading-none">{livePercentage}%</span>
                        <span className="text-[10px] text-slate-500 font-medium"> Completed</span>
                      </div>
                      <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-right shrink-0">
                        <span className="text-lg font-bold text-navy-900 leading-none">{criteriaLiveMarks.toFixed(1)}</span>
                        <span className="text-[10px] text-slate-400 font-medium"> / {typeMaxMarks[item.type]}.0 Sector Marks</span>
                      </div>
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-slate-400 text-xs leading-relaxed font-normal">{item.description}</p>
                  )}

                  {/* Rules reference Box */}
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                    <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                      Grading Standard
                    </h4>

                    {item.type === 'UNIT_SAHITYOTSAV' && (
                      <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-semibold text-navy-900 uppercase">
                        <div className="p-2 bg-white rounded-lg border border-slate-100">70% &rarr; 5m</div>
                        <div className="p-2 bg-white rounded-lg border border-slate-100">80% &rarr; 8m</div>
                        <div className="p-2 bg-white rounded-lg border border-slate-100">90% &rarr; 12m</div>
                        <div className="p-2 bg-white rounded-lg border border-slate-100">100% &rarr; 15m</div>
                      </div>
                    )}
                    {item.type === 'BRIGHT_UNIT_SAHITYOTSAV' && (
                      <div className="grid grid-cols-5 gap-1.5 text-center text-[9px] font-semibold text-navy-900 uppercase">
                        <div className="p-1.5 bg-white rounded-lg border border-slate-100">20%&rarr;5m</div>
                        <div className="p-1.5 bg-white rounded-lg border border-slate-100">40%&rarr;10m</div>
                        <div className="p-1.5 bg-white rounded-lg border border-slate-100">60%&rarr;15m</div>
                        <div className="p-1.5 bg-white rounded-lg border border-slate-100">80%&rarr;20m</div>
                        <div className="p-1.5 bg-white rounded-lg border border-slate-100">100%&rarr;25m</div>
                      </div>
                    )}
                    {item.type === 'SHINE_SECTOR' && (
                      <p className="text-[10px] font-semibold text-indigo-600 uppercase leading-none">
                        Proportional scoring! Completing 100% gives 20 marks. Progress gives linear marks.
                      </p>
                    )}
                  </div>

                  {/* Standard form content depending on targetGroup */}
                  {!isUnitLevel ? (
                    // SECTOR LEVEL CRITERIA (SHINE_SECTOR)
                    (() => {
                      const stateKey = `${item.id}_sector`;
                      const state = formStates[stateKey];
                      return (
                        <div className="space-y-6 pt-4 border-t border-slate-100">
                          {/* Checklist: Tick to Claim */}
                          <div className="flex items-center gap-3 p-4 bg-indigo-50/40 border border-indigo-100/50 rounded-2xl">
                            <input 
                              type="checkbox" 
                              id={`tick-${stateKey}`}
                              checked={state.isTicked}
                              onChange={(e) => updateFormState(stateKey, { isTicked: e.target.checked })}
                              className="w-4.5 h-4.5 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
                            />
                            <label htmlFor={`tick-${stateKey}`} className="text-xs font-bold text-indigo-900 uppercase tracking-tight select-none cursor-pointer">
                              Tick to submit/claim for this grace marks
                            </label>
                          </div>

                          {/* Percentage slider */}
                          {state.isTicked && (
                            <div className="space-y-3 animate-fade-in">
                              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                <span>Completed Percentage</span>
                                <span className="text-navy-900 text-sm font-bold bg-white px-2.5 py-1 border border-slate-200 rounded-lg">{state.percentage}%</span>
                              </div>
                              
                              <div className="flex items-center gap-4">
                                <input 
                                  type="range" 
                                  min="0" 
                                  max="100" 
                                  value={state.percentage}
                                  onChange={(e) => updateFormState(stateKey, { percentage: parseInt(e.target.value) })}
                                  className="flex-grow h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                                <input 
                                  type="number" 
                                  min="0" 
                                  max="100"
                                  value={state.percentage}
                                  onChange={(e) => {
                                    let val = parseInt(e.target.value) || 0;
                                    if (val < 0) val = 0;
                                    if (val > 100) val = 100;
                                    updateFormState(stateKey, { percentage: val });
                                  }}
                                  className="w-16 px-2 py-1.5 border border-slate-200 rounded-xl text-center text-sm focus:outline-none focus:border-indigo-600 font-bold"
                                />
                              </div>
                            </div>
                          )}

                          {/* Individual Save Button */}
                          <div className="space-y-4 pt-2">
                            {state.error && (
                              <div className="bg-rose-50 border border-rose-100 text-rose-700 p-3.5 rounded-xl flex items-center gap-2 text-xs leading-none">
                                <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                                <span>{state.error}</span>
                              </div>
                            )}
                            {state.success && (
                              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-3.5 rounded-xl flex items-center gap-2 text-xs leading-none">
                                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span>{state.success}</span>
                              </div>
                            )}

                            <button
                              onClick={() => handleSaveSector(item.id, item.type)}
                              disabled={state.saving}
                              className="btn-primary w-full py-4 text-[10px] uppercase tracking-[0.2em] font-bold group/btn flex items-center justify-center gap-2"
                            >
                              <Save className="w-4 h-4" />
                              {state.saving ? 'Saving...' : 'Save & Submit Progress'}
                            </button>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    // UNIT LEVEL CRITERIA (UNIT_SAHITYOTSAV, BRIGHT_UNIT_SAHITYOTSAV)
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
                                    ? 'bg-indigo-50/40 border-indigo-100/80 shadow-sm shadow-indigo-50' 
                                    : 'bg-slate-50/40 border-slate-100 hover:border-slate-200'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <input 
                                    type="checkbox" 
                                    id={`tick-${stateKey}`}
                                    checked={state.isTicked}
                                    disabled={state.saving}
                                    onChange={(e) => handleToggleUnit(item.id, item.type, unit.id, e.target.checked)}
                                    className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer disabled:opacity-50"
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
                                    <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
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
                  )}
                </div>
              </ScaleIn>
            );
          })}
        </StaggerContainer>
      )}
    </div>
  );
}
