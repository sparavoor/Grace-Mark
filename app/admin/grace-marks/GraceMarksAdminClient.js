'use client';

import { useState } from 'react';
import { Trophy, Plus, Check, X, ShieldAlert, Award, FileText, ToggleLeft, ToggleRight, Trash2, Pencil, RotateCcw, HelpCircle, Download } from 'lucide-react';
import { FadeInUp, ScaleIn, StaggerContainer } from '@/components/Animate';
import { createGraceMarkCriteria, toggleGraceMarkCriteria, deleteGraceMarkCriteria, updateGraceMarkCriteria } from '@/app/actions/grace-marks';

export default function GraceMarksAdminClient({ initialCriteria, sectorScores }) {
  const [criteria, setCriteria] = useState(initialCriteria);
  const [name, setName] = useState('');
  const [type, setType] = useState('UNIT_SAHITYOTSAV');
  const [description, setDescription] = useState('');
  const [targetSteps, setTargetSteps] = useState('');
  const [shineType, setShineType] = useState('TICK');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const handleExportExcel = () => {
    const headers = ['Sector', 'Criteria Name', 'Type', 'Scope', 'Unit (if unit-level)', 'Status', 'Value completed (Steps/%)', 'Text Answer'];
    const rows = [];
    
    sectorScores.forEach(sector => {
      criteria.forEach(c => {
        const isUnitLevel = c.type === 'UNIT_SAHITYOTSAV' || c.type === 'BRIGHT_UNIT_SAHITYOTSAV';
        const typeLabel = c.type === 'UNIT_SAHITYOTSAV' ? 'Unit Sahityotsav' : c.type === 'BRIGHT_UNIT_SAHITYOTSAV' ? 'Bright Unit Sahityotsav' : 'Shine Sector';
        
        if (isUnitLevel) {
          const sUnits = sector.units || [];
          sUnits.forEach(unit => {
            const sub = (sector.submissions || []).find(s => s.criteriaId === c.id && s.unitId === unit.id);
            const isTicked = sub ? sub.isTicked : false;
            const pct = sub ? sub.percentage : 0;
            
            let status = 'Not Completed';
            if (isTicked) {
              if (c.shineType === 'NUMBER') {
                status = c.targetSteps && pct >= c.targetSteps ? 'Target Reached' : 'Below Target';
              } else {
                status = 'Completed';
              }
            }
            
            rows.push([
              sector.name,
              c.name,
              typeLabel,
              'Unit Level',
              unit.name,
              status,
              c.shineType === 'NUMBER' ? pct : (isTicked ? '100%' : '0%'),
              '-'
            ]);
          });
        } else {
          const sub = (sector.submissions || []).find(s => s.criteriaId === c.id && !s.unitId);
          const isTicked = sub ? sub.isTicked : false;
          const pct = sub ? sub.percentage : 0;
          const textAns = sub ? sub.textAnswer || '' : '';
          
          let status = 'Not Claimed';
          if (isTicked) {
            if (c.shineType === 'NUMBER') {
              status = c.targetSteps && pct >= c.targetSteps ? 'Target Reached' : 'Below Target';
            } else {
              status = 'Claimed';
            }
          }
          
          rows.push([
            sector.name,
            c.name,
            typeLabel,
            'Sector Level',
            '-',
            status,
            c.shineType === 'NUMBER' ? pct : (isTicked ? '100%' : '0%'),
            textAns || '-'
          ]);
        }
      });
    });
    
    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += [headers.join(','), ...rows.map(row => row.map(val => `"${val}"`).join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `SSF_Gracemark_Detailed_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    const dateStr = new Date().toLocaleDateString();
    
    const sectorsHtml = sectorScores.map(sector => {
      const detailedRows = criteria.map(c => {
        const isUnitLevel = c.type === 'UNIT_SAHITYOTSAV' || c.type === 'BRIGHT_UNIT_SAHITYOTSAV';
        const typeLabel = c.type === 'UNIT_SAHITYOTSAV' ? 'Unit Sahityotsav' : c.type === 'BRIGHT_UNIT_SAHITYOTSAV' ? 'Bright Unit Sahityotsav' : 'Shine Sector';
        
        let completionDetail = '';
        let statusClass = 'status-pending';
        
        if (isUnitLevel) {
          const sUnits = sector.units || [];
          let completed = 0;
          let completedNames = [];
          
          sUnits.forEach(unit => {
            const sub = (sector.submissions || []).find(s => s.criteriaId === c.id && s.unitId === unit.id);
            const isTicked = sub ? sub.isTicked : false;
            const pct = sub ? sub.percentage : 0;
            
            let isDone = isTicked;
            if (isTicked && c.shineType === 'NUMBER' && c.targetSteps) {
              isDone = pct >= c.targetSteps;
            }
            
            if (isDone) {
              completed++;
              completedNames.push(unit.name);
            }
          });
          
          completionDetail = `Completed in ${completed} / ${sUnits.length} Units` + 
            (completedNames.length > 0 ? ` (${completedNames.join(', ')})` : '');
          statusClass = completed === sUnits.length ? 'status-success' : completed > 0 ? 'status-partial' : 'status-pending';
        } else {
          const sub = (sector.submissions || []).find(s => s.criteriaId === c.id && !s.unitId);
          const isTicked = sub ? sub.isTicked : false;
          const pct = sub ? sub.percentage : 0;
          const textAns = sub ? sub.textAnswer : '';
          
          if (isTicked) {
            if (c.shineType === 'NUMBER') {
              completionDetail = c.targetSteps && pct >= c.targetSteps 
                ? `Target Reached (${pct} steps completed)` 
                : `Below Target (${pct} steps completed)`;
              statusClass = c.targetSteps && pct >= c.targetSteps ? 'status-success' : 'status-partial';
            } else if (c.shineType === 'TEXT') {
              completionDetail = `Claimed - Short Answer: "${textAns}"`;
              statusClass = 'status-success';
            } else {
              completionDetail = 'Claimed';
              statusClass = 'status-success';
            }
          } else {
            completionDetail = 'Not Claimed';
            statusClass = 'status-pending';
          }
        }
        
        return `
          <tr>
            <td style="font-weight: 600;">${c.name}</td>
            <td>${typeLabel}</td>
            <td><span class="status-badge ${statusClass}">${completionDetail}</span></td>
          </tr>
        `;
      }).join('');

      return `
        <div class="sector-block">
          <h2>Sector: ${sector.name}</h2>
          <div class="score-summary">
            Unit Sahityotsav: <strong>${sector.graceMarks.unitSahityotsav.marks} / 15</strong> | 
            Bright Unit: <strong>${sector.graceMarks.brightUnitSahityotsav.marks} / 25</strong> | 
            Shine Sector: <strong>${sector.graceMarks.shineSector.marks} / 20</strong> | 
            Cumulative Score: <strong style="color: #4f46e5;">${sector.graceMarksTotal.toFixed(1)} / 60.0</strong>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 40%;">Criteria Name</th>
                <th style="width: 25%;">Type</th>
                <th style="width: 35%;">Submission Detail / Status</th>
              </tr>
            </thead>
            <tbody>
              ${detailedRows}
            </tbody>
          </table>
        </div>
      `;
    }).join('<div class="page-break"></div>');

    const htmlContent = `
      <html>
        <head>
          <title>Detailed Gracemark Performance Ledger</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              color: #1e293b;
              padding: 40px;
            }
            h1 {
              color: #0f172a;
              font-size: 24px;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 5px;
            }
            h2 {
              color: #0f172a;
              font-size: 16px;
              text-transform: uppercase;
              border-bottom: 2px solid #f1f5f9;
              padding-bottom: 8px;
              margin-top: 0;
            }
            .subtitle {
              color: #64748b;
              font-size: 13px;
              margin-bottom: 40px;
            }
            .sector-block {
              margin-bottom: 40px;
            }
            .score-summary {
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 12px 15px;
              font-size: 12px;
              margin-bottom: 15px;
              font-weight: 500;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #e2e8f0;
              padding: 10px 12px;
              text-align: left;
              font-size: 12px;
            }
            th {
              background-color: #f8fafc;
              color: #475569;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              font-weight: 700;
            }
            .status-badge {
              font-size: 11px;
              font-weight: 600;
              padding: 2px 6px;
              border-radius: 4px;
            }
            .status-success {
              background-color: #ecfdf5;
              color: #065f46;
            }
            .status-partial {
              background-color: #fef3c7;
              color: #92400e;
            }
            .status-pending {
              background-color: #f8fafc;
              color: #64748b;
            }
            .page-break {
              page-break-after: always;
            }
            .footer {
              margin-top: 50px;
              font-size: 10px;
              color: #94a3b8;
              text-align: center;
              border-top: 1px solid #f1f5f9;
              padding-top: 20px;
            }
            @media print {
              body { padding: 0; }
              .page-break { page-break-after: always; }
            }
          </style>
        </head>
        <body>
          <h1>Detailed Gracemark Performance Ledger</h1>
          <div class="subtitle">Generated on ${dateStr} | SSF Pulikkal Division</div>
          
          ${sectorsHtml}
          
          <div class="footer">
            Grace Mark Management System &copy; ${new Date().getFullYear()} - SSF Pulikkal Division. All rights reserved.
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

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
    formData.append('shineType', (type === 'SHINE_SECTOR' || type === 'BRIGHT_UNIT_SAHITYOTSAV' || type === 'UNIT_SAHITYOTSAV') ? shineType : 'TICK');
    if ((type === 'SHINE_SECTOR' || type === 'BRIGHT_UNIT_SAHITYOTSAV' || type === 'UNIT_SAHITYOTSAV') && shineType === 'NUMBER' && targetSteps !== '') {
      formData.append('targetSteps', targetSteps);
    } else {
      formData.append('targetSteps', '');
    }

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
  }

  function cancelEdit() {
    setEditingId(null);
    setName('');
    setType('UNIT_SAHITYOTSAV');
    setDescription('');
    setTargetSteps('');
    setShineType('TICK');
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
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 font-medium bg-white"
                >
                  <option value="UNIT_SAHITYOTSAV">Unit Sahityotsav (Max 15 Marks)</option>
                  <option value="BRIGHT_UNIT_SAHITYOTSAV">Bright Unit Sahityotsav (Max 25 Marks)</option>
                  <option value="SHINE_SECTOR">Shine Sector (Max 20 Marks)</option>
                </select>
              </div>

              {(type === 'SHINE_SECTOR' || type === 'BRIGHT_UNIT_SAHITYOTSAV' || type === 'UNIT_SAHITYOTSAV') && (
                <div className="animate-fade-in p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-navy-800 mb-2">Evaluation Mode</label>
                    <select 
                      value={shineType} 
                      onChange={(e) => setShineType(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 font-medium bg-white text-navy-900"
                    >
                      <option value="TICK">Simple Checkbox Tick</option>
                      <option value="NUMBER">Number Input - Steps Goal (Threshold-based)</option>
                      <option value="TEXT">Short Answer text Input</option>
                    </select>
                  </div>

                  {shineType === 'NUMBER' && (
                    <div className="animate-fade-in space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-amber-800 mb-1">Target Steps Required</label>
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
              )}

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
              <div className="space-y-4">
                {criteria.map((item) => (
                  <div key={item.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 border rounded-2xl hover:shadow-md transition-all gap-4 ${
                    editingId === item.id 
                      ? 'border-indigo-600 bg-indigo-50/10 shadow-sm shadow-indigo-100' 
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-bold text-navy-900 text-base uppercase leading-none">{item.name}</h3>
                        <span className="text-[9px] px-2.5 py-1 rounded bg-indigo-50 text-indigo-600 font-semibold uppercase tracking-wider border border-indigo-100">
                          {typeLabels[item.type]}
                        </span>
                        {(item.type === 'SHINE_SECTOR' || item.type === 'BRIGHT_UNIT_SAHITYOTSAV' || item.type === 'UNIT_SAHITYOTSAV') && (
                          <span className="text-[9px] px-2.5 py-1 rounded bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border border-slate-100">
                            {shineTypeLabels[item.shineType || 'TICK']}
                          </span>
                        )}
                        {(item.type === 'SHINE_SECTOR' || item.type === 'BRIGHT_UNIT_SAHITYOTSAV' || item.type === 'UNIT_SAHITYOTSAV') && item.shineType === 'NUMBER' && item.targetSteps !== null && (
                          <span className="text-[9px] px-2.5 py-1 rounded bg-amber-50 text-amber-700 font-bold uppercase tracking-wider border border-amber-100">
                            Goal: {item.targetSteps} Steps Required
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
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sectors Performance Table */}
      <section className="card-premium overflow-hidden p-0">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-bold text-navy-900 uppercase flex items-center gap-3">
            <Trophy className="w-5 h-5 text-indigo-600" />
            Sectors Grace Marks Performance
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:border-indigo-650 hover:bg-indigo-50/50 rounded-xl text-xs font-bold text-slate-650 hover:text-indigo-650 transition-all font-sans uppercase tracking-wider"
              title="Download Excel Spreadsheet (CSV)"
            >
              <Download className="w-4 h-4" />
              Excel
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:border-rose-650 hover:bg-rose-50/50 rounded-xl text-xs font-bold text-slate-650 hover:text-rose-650 transition-all font-sans uppercase tracking-wider"
              title="Save as PDF / Print Report"
            >
              <FileText className="w-4 h-4" />
              PDF
            </button>
          </div>
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
