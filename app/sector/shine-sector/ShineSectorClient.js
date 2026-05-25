'use client';

import { useState } from 'react';
import { Trophy, Check, ShieldAlert, Award, HelpCircle, Save, Star, FileText } from 'lucide-react';
import { FadeInUp, ScaleIn, StaggerContainer } from '@/components/Animate';
import { submitSectorGraceMarks } from '@/app/actions/grace-marks';

export default function ShineSectorClient({ criteria, initialSubmissions }) {
  const initialMap = {};
  initialSubmissions.forEach(sub => {
    if (!sub.unitId) {
      const key = `${sub.criteriaId}_sector`;
      initialMap[key] = {
        percentage: sub.percentage,
        isTicked: sub.isTicked,
        textAnswer: sub.textAnswer || '',
        saved: true
      };
    }
  });

  const [formStates, setFormStates] = useState(() => {
    const states = {};
    criteria.forEach(c => {
      const key = `${c.id}_sector`;
      const existing = initialMap[key];
      states[key] = {
        percentage: existing ? existing.percentage : (c.shineType === 'NUMBER' ? 0 : 100),
        isTicked: existing ? existing.isTicked : false,
        textAnswer: existing ? existing.textAnswer : '',
        saving: false,
        error: '',
        success: ''
      };
    });
    return states;
  });

  const criteriaCount = criteria.length > 0 ? criteria.length : 1;
  const marksPerCriteria = 20 / criteriaCount;

  function getMarksForPercentage(percentage, targetSteps = null, shineType = 'TICK') {
    const pct = parseFloat(percentage) || 0;
    if (shineType === 'TICK' || shineType === 'TEXT') {
      return marksPerCriteria;
    }
    if (shineType === 'NUMBER') {
      if (targetSteps && targetSteps > 0) {
        return pct >= targetSteps ? marksPerCriteria : 0;
      }
      return parseFloat(((pct / 100) * marksPerCriteria).toFixed(2));
    }
    return parseFloat(((pct / 100) * marksPerCriteria).toFixed(2));
  }

  function calculateCriteriaLiveMarks(criteriaItem) {
    const state = formStates[`${criteriaItem.id}_sector`];
    if (state && state.isTicked) {
      return getMarksForPercentage(state.percentage, criteriaItem.targetSteps, criteriaItem.shineType);
    }
    return 0;
  }

  async function handleSaveSector(criteriaId) {
    const key = `${criteriaId}_sector`;
    const state = formStates[key];

    updateFormState(key, { error: '', success: '', saving: true });

    const result = await submitSectorGraceMarks(
      criteriaId,
      state.percentage,
      state.isTicked,
      null,
      state.textAnswer || null
    );

    if (result.error) {
      updateFormState(key, { error: result.error, saving: false });
    } else {
      updateFormState(key, {
        success: `Successfully updated!`,
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
            Shine <span className="text-amber-500 font-bold">Sector</span>
          </h1>
          <p className="text-slate-500 font-normal text-sm mt-1">Claim Shine Sector progress to earn proportionally scaled or threshold-based sector marks.</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-navy-900 border border-slate-800 rounded-[10px] text-white font-semibold text-xs shadow-xl shadow-navy-900/20">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="uppercase tracking-[0.2em] font-bold">Estimated Grace Score: {totalLiveMarks.toFixed(1)} / 20.0</span>
        </div>
      </FadeInUp>

      {criteria.length === 0 ? (
        <ScaleIn className="card-premium text-center py-20 border-2 border-dashed border-slate-200">
          <Award className="w-16 h-16 text-slate-300 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-navy-900 uppercase mb-2">No Active Shine Sector Criteria</h3>
          <p className="text-slate-400 max-w-md mx-auto text-sm">The Division Admin has not enabled any active criteria for Shine Sector at the moment.</p>
        </ScaleIn>
      ) : (
        <StaggerContainer className="grid grid-cols-1 gap-8">
          {criteria.map((item) => {
            const criteriaLiveMarks = calculateCriteriaLiveMarks(item);
            const stateKey = `${item.id}_sector`;
            const state = formStates[stateKey] || { percentage: 0, isTicked: false, textAnswer: '', saving: false, error: '', success: '' };
            const hasTarget = item.shineType === 'NUMBER' && item.targetSteps !== null && item.targetSteps > 0;
            const targetReached = hasTarget && state.percentage >= item.targetSteps;

            return (
              <ScaleIn key={item.id} className="card-premium flex flex-col justify-between relative overflow-hidden group w-full">
                <div className="space-y-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-1.5">
                      <h3 className="text-xl font-bold text-navy-900 uppercase tracking-tight leading-none">{item.name}</h3>
                      <div className="flex gap-2 items-center flex-wrap pt-1">
                        <span className="text-[9px] px-2.5 py-1 rounded bg-amber-50 text-amber-600 font-semibold uppercase tracking-wider border border-amber-100">
                          Shine Sector
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
                            Short Answer Required
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-right shrink-0">
                        <span className="text-lg font-bold text-navy-900 leading-none">{criteriaLiveMarks.toFixed(1)}</span>
                        <span className="text-[10px] text-slate-400 font-medium"> / {marksPerCriteria.toFixed(1)} Sector Marks</span>
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
                      <p className="text-[10px] font-semibold text-indigo-600 uppercase leading-none">
                        Goal-based scoring! Reach or exceed <span className="font-bold text-indigo-800">{item.targetSteps} steps</span> to unlock the full <span className="font-bold text-indigo-800">{marksPerCriteria.toFixed(1)} grace marks</span>. Below {item.targetSteps} steps yields 0 marks.
                      </p>
                    ) : item.shineType === 'TEXT' ? (
                      <p className="text-[10px] font-semibold text-indigo-600 uppercase leading-none">
                        Tick to claim and submit a short answer response to receive the full <span className="font-bold text-indigo-800">{marksPerCriteria.toFixed(1)} grace marks</span>.
                      </p>
                    ) : (
                      <p className="text-[10px] font-semibold text-indigo-600 uppercase leading-none">
                        Tick option scoring! Ticking this checkbox unlocks the full <span className="font-bold text-indigo-800">{marksPerCriteria.toFixed(1)} grace marks</span>.
                      </p>
                    )}
                  </div>

                  <div className="space-y-6 pt-4 border-t border-slate-100">
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

                    {state.isTicked && (
                      <div className="space-y-4 animate-fade-in">
                        {item.shineType === 'NUMBER' && (
                          <div className="space-y-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                              <span>Completed Steps Taken</span>
                              <div className="flex items-center gap-2">
                                {targetReached ? (
                                  <span className="text-[9px] px-2 py-1 rounded bg-emerald-50 text-emerald-600 font-bold border border-emerald-100">
                                    🏆 TARGET REACHED
                                  </span>
                                ) : (
                                  <span className="text-[9px] px-2 py-1 rounded bg-rose-50 text-rose-600 font-bold border border-rose-100">
                                    ❌ BELOW TARGET
                                  </span>
                                )}
                                <span className="text-navy-900 text-sm font-bold bg-white px-2.5 py-1 border border-slate-200 rounded-lg">
                                  {state.percentage} / {item.targetSteps} Steps
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 pt-2">
                              <input
                                type="number"
                                min="0"
                                value={state.percentage}
                                onChange={(e) => {
                                  let val = parseInt(e.target.value) || 0;
                                  if (val < 0) val = 0;
                                  updateFormState(stateKey, { percentage: val });
                                }}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-center text-base focus:outline-none focus:border-indigo-600 font-bold bg-white"
                                placeholder="Enter steps completed"
                              />
                            </div>
                          </div>
                        )}

                        {item.shineType === 'TEXT' && (
                          <div className="space-y-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl animate-fade-in">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Short Answer / Response</label>
                            <textarea
                              value={state.textAnswer || ''}
                              onChange={(e) => updateFormState(stateKey, { textAnswer: e.target.value })}
                              placeholder="Type your response/answer here..."
                              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 font-medium bg-white h-24 resize-none text-navy-900"
                              required
                            />
                          </div>
                        )}

                        {item.shineType === 'TICK' && (
                          <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-center animate-fade-in">
                            <p className="text-xs font-semibold text-emerald-800 uppercase tracking-tight">
                              🎉 Checked! You get the full {marksPerCriteria.toFixed(1)} grace marks.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

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
                        onClick={() => handleSaveSector(item.id)}
                        disabled={state.saving}
                        className="btn-primary w-full py-4 text-[10px] uppercase tracking-[0.2em] font-bold group/btn flex items-center justify-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {state.saving ? 'Saving...' : 'Save & Submit Progress'}
                      </button>
                    </div>
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
