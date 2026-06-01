'use client';

import { useState } from 'react';
import { Trophy, Plus, Check, X, ShieldAlert, Award, FileText, ToggleLeft, ToggleRight, Trash2, Pencil, RotateCcw, HelpCircle } from 'lucide-react';
import { FadeInUp, ScaleIn, StaggerContainer } from '@/components/Animate';
import { createGraceMarkCriteria, toggleGraceMarkCriteria, deleteGraceMarkCriteria, updateGraceMarkCriteria } from '@/app/actions/grace-marks';

export default function GraceMarksAdminClient({ initialCriteria, sectorScores }) {
  const [criteria, setCriteria] = useState(initialCriteria);
  const [name, setName] = useState('');
  const [type, setType] = useState('UNIT_SAHITYOTSAV');
  const [description, setDescription] = useState('');
  const [targetSteps, setTargetSteps] = useState('');
  const [shineType, setShineType] = useState('TICK');
  const [parentId, setParentId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  async function handleSubmitCriteria(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('type', type);
    formData.append('description', description);
    formData.append('isActive', isActive ? 'true' : 'false');
    formData.append('shineType', shineType);
    if (shineType === 'NUMBER' && targetSteps !== '') {
      formData.append('targetSteps', targetSteps);
    } else {
      formData.append('targetSteps', '');
    }
    formData.append('parentId', parentId);

    if (editingId) {
      const result = await updateGraceMarkCriteria(editingId, formData);
      setIsSubmitting(false);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess('Criteria updated successfully!');
        setCriteria(criteria.map(c => c.id === editingId ? result.criteria : c));
        cancelEdit();
      }
    } else {
      const result = await createGraceMarkCriteria(formData);
      setIsSubmitting(false);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess('Criteria created successfully!');
        setCriteria([result.criteria, ...criteria]);
        cancelEdit();
      }
    }
  }

  function startEdit(item) {
    setEditingId(item.id);
    setName(item.name);
    setType(item.type);
    setDescription(item.description || '');
    setIsActive(item.isActive);
    setShineType(item.shineType || 'TICK');
    setTargetSteps(item.targetSteps !== null && item.targetSteps !== undefined ? String(item.targetSteps) : '');
    setParentId(item.parentId || '');
  }

  function cancelEdit() {
    setEditingId(null);
    setName('');
    setType('UNIT_SAHITYOTSAV');
    setDescription('');
    setTargetSteps('');
    setShineType('TICK');
    setParentId('');
    setIsActive(true);
  }

  async function handleToggleActive(id, currentStatus) {
    const nextStatus = !currentStatus;
    // Optimistic UI update
    setCriteria(criteria.map(c => c.id === id ? { ...c, isActive: nextStatus } : c));

    const result = await toggleGraceMarkCriteria(id, nextStatus);
    if (result.error) {
      setError(result.error);
      // Revert on error
      setCriteria(criteria.map(c => c.id === id ? { ...c, isActive: currentStatus } : c));
    } else {
      setSuccess('Criteria status updated successfully.');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this criteria? This will permanently remove all submitted sector progress scores for this criteria.')) {
      return;
    }

    const previousCriteria = [...criteria];
    setCriteria(criteria.filter(c => c.id !== id));

    const result = await deleteGraceMarkCriteria(id);
    if (result.error) {
      setError(result.error);
      setCriteria(previousCriteria);
    } else {
      setSuccess('Criteria deleted successfully.');
    }
  }

  const typeLabels = {
    UNIT_SAHITYOTSAV: 'Unit Sahityotsav',
    BRIGHT_UNIT_SAHITYOTSAV: 'Bright Unit Sahityotsav',
    SHINE_SECTOR: 'Shine Sector'
  };

  const shineTypeLabels = {
    TICK: 'Simple Checkbox Tick',
    NUMBER: 'Number Input (Steps)',
    TEXT: 'Short Answer Input'
  };

  const typeMaxMarks = {
    UNIT_SAHITYOTSAV: 15,
    BRIGHT_UNIT_SAHITYOTSAV: 25,
    SHINE_SECTOR: 20
  };

  const renderCriteriaCard = (item, isSub = false) => {
    return (
      <div key={item.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 border rounded-2xl hover:shadow-md transition-all gap-4 ${
        isSub ? 'ml-8 bg-slate-50/40 border-dashed border-slate-200' : 'bg-white border-slate-100 hover:border-slate-200'
      } ${
        editingId === item.id 
          ? 'border-indigo-600 bg-indigo-50/10 shadow-sm shadow-indigo-100' 
          : ''
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            {isSub && (
              <span className="text-[9px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-bold uppercase tracking-wider border border-slate-200 flex items-center gap-1">
                ↳ Sub-Question
              </span>
            )}
            <h3 className="font-bold text-navy-900 text-base uppercase leading-none">{item.name}</h3>
            <span className="text-[9px] px-2.5 py-1 rounded bg-indigo-50 text-indigo-600 font-semibold uppercase tracking-wider border border-indigo-100">
              {typeLabels[item.type]}
            </span>
            {item.shineType && item.shineType !== 'TICK' && (
              <span className="text-[9px] px-2.5 py-1 rounded bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border border-slate-100">
                {shineTypeLabels[item.shineType || 'TICK']}
              </span>
            )}
            {item.shineType === 'NUMBER' && item.targetSteps !== null && (
              <span className="text-[9px] px-2.5 py-1 rounded bg-amber-50 text-amber-700 font-bold uppercase tracking-wider border border-amber-100">
                Goal: {item.targetSteps} Target
              </span>
            )}
            <span className="text-[9px] px-2.5 py-1 rounded bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border border-slate-100">
              Max: {typeMaxMarks[item.type]} Marks
            </span>
          </div>
          {item.description && (
            <p className="text-slate-400 text-xs font-normal leading-relaxed">{item.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
          {/* Tick Toggle (Option to Tick / Activate) */}
          <button 
            onClick={() => handleToggleActive(item.id, item.isActive)}
            className="flex items-center gap-2 group"
            title={item.isActive ? 'Tick Active (Click to Untick)' : 'Tick Inactive (Click to Tick)'}
          >
            {item.isActive ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                <Check className="w-3.5 h-3.5" />
                Active (Ticked)
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <X className="w-3.5 h-3.5" />
                Inactive
              </div>
            )}
          </button>

          {/* Edit Button */}
          <button 
            onClick={() => startEdit(item)}
            className="p-2 text-slate-300 hover:text-indigo-600 transition-colors bg-slate-50 hover:bg-indigo-50 rounded-lg border border-slate-100 hover:border-indigo-100"
            title="Edit Criteria"
          >
            <Pencil className="w-4 h-4" />
          </button>

          {/* Delete */}
          <button 
            onClick={() => handleDelete(item.id)}
            className="p-2 text-slate-300 hover:text-rose-600 transition-colors bg-slate-50 hover:bg-rose-50 rounded-lg border border-slate-100 hover:border-rose-100"
            title="Delete Criteria"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <FadeInUp className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-navy-900 uppercase">
            Grace Marks <span className="text-indigo-600 font-bold">Management</span>
          </h1>
          <p className="text-slate-500 font-normal text-sm mt-1">Configure criteria, toggle statuses, and view sector progress.</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-[10px] text-navy-900 font-semibold text-xs shadow-sm">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span className="uppercase tracking-[0.2em] font-bold">Total Max: 60 Marks</span>
        </div>
      </FadeInUp>

      {/* Alerts */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-center gap-3 text-sm animate-shake">
          <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-3 text-sm animate-fade-in">
          <Check className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Create / Edit Criteria Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card-premium">
            <h2 className="text-xl font-bold text-navy-900 uppercase flex items-center gap-3 mb-6">
              {editingId ? <Pencil className="w-5 h-5 text-indigo-600 animate-pulse" /> : <Plus className="w-5 h-5 text-indigo-600" />}
              {editingId ? 'Edit Criteria' : 'Add New Criteria'}
            </h2>

            <form onSubmit={handleSubmitCriteria} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Criteria Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Shine Sector Program" 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Criteria Type</label>
                <select 
                  value={type} 
                  onChange={(e) => {
                    setType(e.target.value);
                    setParentId('');
                  }}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 font-medium bg-white"
                >
                  <option value="UNIT_SAHITYOTSAV">Unit Sahityotsav (Max 15 Marks)</option>
                  <option value="BRIGHT_UNIT_SAHITYOTSAV">Bright Unit Sahityotsav (Max 25 Marks)</option>
                  <option value="SHINE_SECTOR">Shine Sector (Max 20 Marks)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Parent Question (Optional)</label>
                <select 
                  value={parentId} 
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 font-medium bg-white text-navy-900"
                >
                  <option value="">None (Top Level Question)</option>
                  {criteria
                    .filter(c => c.type === type && !c.parentId && c.id !== editingId)
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))
                  }
                </select>
              </div>

              <div className="animate-fade-in p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-navy-800 mb-2">Evaluate Mode</label>
                  <select 
                    value={shineType} 
                    onChange={(e) => setShineType(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 font-medium bg-white text-navy-900"
                  >
                    <option value="TICK">Simple Checkbox Tick</option>
                    <option value="NUMBER">Number Input (Target Goal)</option>
                    <option value="TEXT">Short Answer Text Input</option>
                  </select>
                </div>

                {shineType === 'NUMBER' && (
                  <div className="animate-fade-in space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-amber-800 mb-1">Target steps / threshold required</label>
                    <input 
                      type="number" 
                      min="1"
                      placeholder="e.g. 5"
                      value={targetSteps} 
                      onChange={(e) => setTargetSteps(e.target.value)}
                      className="w-full px-4 py-2.5 border border-amber-200 rounded-xl text-sm focus:outline-none focus:border-amber-600 font-bold bg-white text-navy-900"
                      required={shineType === 'NUMBER'}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Description</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details and guidelines of this grace mark criteria..." 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 font-medium h-24 resize-none"
                />
              </div>

              <div className="flex items-center gap-3 py-2">
                <input 
                  type="checkbox" 
                  id="isActive" 
                  checked={isActive} 
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-navy-900 uppercase tracking-tight select-none cursor-pointer">
                  Tick to Enable Immediately
                </label>
              </div>

              <div className="flex items-center gap-4">
                {editingId && (
                  <button 
                    type="button"
                    onClick={cancelEdit}
                    className="w-1/3 py-4 border border-slate-200 text-slate-500 rounded-xl text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                )}
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`btn-primary py-4 text-[10px] uppercase tracking-[0.2em] font-bold flex-grow ${editingId ? 'bg-indigo-600' : ''}`}
                >
                  {isSubmitting ? (editingId ? 'Saving...' : 'Creating...') : (editingId ? 'Save Changes' : 'Create Criteria')}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Criteria List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-premium">
            <h2 className="text-xl font-bold text-navy-900 uppercase flex items-center gap-3 mb-6">
              <Award className="w-5 h-5 text-indigo-600" />
              Configured Grace Criteria
            </h2>

            {criteria.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-400 text-sm font-medium">No grace criteria defined yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {criteria.filter(c => !c.parentId).map((item) => {
                  const subItems = criteria.filter(c => c.parentId === item.id);
                  return (
                    <div key={item.id} className="space-y-3">
                      {renderCriteriaCard(item, false)}
                      {subItems.map(subItem => renderCriteriaCard(subItem, true))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sectors Performance Table */}
      <section className="card-premium overflow-hidden p-0">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-navy-900 uppercase flex items-center gap-3">
            <Trophy className="w-5 h-5 text-indigo-600" />
            Sectors Grace Marks Performance
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">Sector</th>
                <th className="px-8 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] text-center">Unit Sahityotsav</th>
                <th className="px-8 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] text-center">Bright Unit Sahityotsav</th>
                <th className="px-8 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] text-center">Shine Sector</th>
                <th className="px-8 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] text-right">Total Grace Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {sectorScores.map((sector) => (
                <tr key={sector.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-6">
                    <p className="font-bold text-navy-900 text-sm uppercase leading-none">{sector.name}</p>
                    <p className="text-[9px] text-slate-400 uppercase font-medium tracking-widest mt-1.5">{sector.unitsCount} Units</p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    {sector.graceMarks.unitSahityotsav.isTicked ? (
                      <div className="inline-block text-center">
                        <span className="text-sm font-semibold text-navy-900 leading-none">{sector.graceMarks.unitSahityotsav.marks} / 15</span>
                        <p className="text-[9px] text-indigo-600 font-semibold tracking-tighter mt-1">{sector.graceMarks.unitSahityotsav.percentage}% Completed</p>
                      </div>
                    ) : (
                      <span className="text-slate-300 text-xs font-normal">-</span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-center">
                    {sector.graceMarks.brightUnitSahityotsav.isTicked ? (
                      <div className="inline-block text-center">
                        <span className="text-sm font-semibold text-navy-900 leading-none">{sector.graceMarks.brightUnitSahityotsav.marks} / 25</span>
                        <p className="text-[9px] text-emerald-600 font-semibold tracking-tighter mt-1">{sector.graceMarks.brightUnitSahityotsav.percentage}% Completed</p>
                      </div>
                    ) : (
                      <span className="text-slate-300 text-xs font-normal">-</span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-center">
                    {sector.graceMarks.shineSector.isTicked ? (
                      <div className="inline-block text-center">
                        <span className="text-sm font-semibold text-navy-900 leading-none">{sector.graceMarks.shineSector.marks} / 20</span>
                        <p className="text-[9px] text-amber-600 font-semibold tracking-tighter mt-1">
                          {sector.graceMarks.shineSector.percentage} reported
                        </p>
                      </div>
                    ) : (
                      <span className="text-slate-300 text-xs font-normal">-</span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-lg font-bold text-indigo-600 leading-none">{sector.graceMarksTotal.toFixed(1)}</span>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter"> / 60.0</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
