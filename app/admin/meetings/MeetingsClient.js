'use client';

import { createMeeting, updateMeeting, deleteMeeting } from '@/app/actions/meeting';
import { useState } from 'react';
import Drawer from '@/components/Drawer';
import { Plus, Calendar, Clock, Target, Edit2, Trash2, Shield, Info, ArrowRight, Trophy, Activity } from 'lucide-react';
import { FadeInUp, ScaleIn, StaggerContainer } from '@/components/Animate';

export default function MeetingsClient({ initialMeetings, sectors = [] }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [msg, setMsg] = useState('');
  const [targetGroup, setTargetGroup] = useState('SECTOR');

  async function handleCreate(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const res = await createMeeting(formData);
    if (res?.error) setMsg(res.error);
    else {
      setMsg('Meeting created successfully!');
      e.target.reset();
      setIsDrawerOpen(false);
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const res = await updateMeeting(editingMeeting.id, formData);
    if (res?.error) setMsg(res.error);
    else {
      setMsg('Meeting updated successfully!');
      setEditingMeeting(null);
      setIsDrawerOpen(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this meeting? This will also delete any related reports.')) return;
    const res = await deleteMeeting(id);
    if (res?.error) setMsg(res.error);
    else setMsg('Meeting deleted successfully!');
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toISOString().slice(0, 16);
  };

  const openEdit = (meeting) => {
    setEditingMeeting(meeting);
    setTargetGroup(meeting.targetGroup);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-10 pb-10">
      <FadeInUp className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-navy-900 uppercase leading-none">
            Meeting <span className="text-brand-indigo">Manager</span>
          </h1>
          <p className="text-slate-500 font-normal text-sm md:text-base mt-2">Schedule and manage sector and unit meetings.</p>
        </div>
        <button 
          onClick={() => { setEditingMeeting(null); setIsDrawerOpen(true); }}
          className="btn-primary"
        >
          <Plus className="w-5 h-5 mr-1" />
          <span>Create New Meeting</span>
        </button>
      </FadeInUp>

      {msg && (
        <FadeInUp className={`p-4 rounded-[10px] border ${
          msg.includes('success') ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
        } text-xs font-bold text-center shadow-sm uppercase tracking-widest`}>
          {msg}
        </FadeInUp>
      )}

      {/* Meeting List - Elevated Cards */}
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {initialMeetings.length === 0 && (
          <FadeInUp className="col-span-full py-32 text-center card-premium border-dashed border-slate-200 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Calendar className="w-10 h-10 text-slate-200" />
            </div>
            <p className="text-slate-400 font-normal uppercase tracking-widest text-xs mb-8">No meetings found</p>
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="btn-secondary text-[10px] font-semibold uppercase tracking-widest"
            >
              Create First Meeting
            </button>
          </FadeInUp>
        )}
        {initialMeetings.map((m, idx) => (
          <ScaleIn key={m.id} delay={idx * 0.05} className="card-premium flex flex-col group relative overflow-hidden h-full">
            <div className="flex justify-between items-start mb-8 relative z-10">
              <span className={`px-3 py-1.5 rounded-lg text-[9px] font-medium uppercase tracking-widest border ${
                m.targetGroup === 'SECTOR' 
                  ? 'bg-brand-light text-brand-indigo border-indigo-100 shadow-sm' 
                  : 'bg-amber-50 text-amber-600 border-amber-100 shadow-sm'
              }`}>
                {m.targetGroup} Level
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => openEdit(m)}
                  className="p-3 bg-white rounded-lg text-slate-400 hover:text-navy-900 shadow-sm border border-slate-100 transition-all hover:scale-110"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(m.id)}
                  className="p-3 bg-white rounded-lg text-slate-400 hover:text-rose-600 shadow-sm border border-slate-100 transition-all hover:scale-110"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mb-10 relative z-10">
                <h3 className="text-2xl font-bold text-navy-900 tracking-tight group-hover:text-brand-indigo transition-colors leading-tight uppercase mb-3">{m.name}</h3>
                {m.description && <p className="text-sm text-slate-500 line-clamp-2 font-normal leading-relaxed tracking-tight">{m.description}</p>}
            </div>

            <div className="mt-auto space-y-4 pt-8 border-t border-slate-50 relative z-10">
              <div className="flex items-center gap-4 text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-none">
                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-brand-light transition-colors">
                    <Calendar className="w-4 h-4 text-slate-300 group-hover:text-brand-indigo transition-colors" />
                </div>
                <span>{new Date(m.startDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-none">
                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-brand-light transition-colors">
                    <Clock className="w-4 h-4 text-slate-300 group-hover:text-brand-indigo transition-colors" />
                </div>
                <span>{new Date(m.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              
              {m.assignedUnitId && m.assignedUnitId !== 'ALL' && (
                <div className="flex items-center gap-3 px-4 py-3 bg-brand-light border border-indigo-100 rounded-lg text-[9px] font-semibold text-brand-indigo uppercase tracking-[0.2em]">
                  <Activity className="w-4 h-4 animate-pulse" />
                  Specific Unit Only
                </div>
              )}
            </div>
            
            <div className="absolute -right-6 -bottom-6 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity transform group-hover:-rotate-12 duration-700">
                <Trophy className="w-32 h-32" />
            </div>
          </ScaleIn>
        ))}
      </StaggerContainer>

      {/* Slide-out Drawer Form - Clean Modern Style */}
      <Drawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        title={editingMeeting ? 'EDIT MEETING' : 'CREATE MEETING'}
      >
        <form onSubmit={editingMeeting ? handleUpdate : handleCreate} className="space-y-8 py-2">
          <div className="space-y-2">
            <label className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.3em]">Meeting Type</label>
            <input 
              name="name" 
              type="text" 
              required 
              placeholder="e.g. Secretariat" 
              defaultValue={editingMeeting?.name || ''} 
              className="input-standard text-lg font-semibold uppercase tracking-tight" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.3em]">Description</label>
            <textarea 
              name="description" 
              rows="4" 
              placeholder="Enter meeting details..." 
              defaultValue={editingMeeting?.description || ''} 
              className="input-standard font-medium" 
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em]">Start Date</label>
              <input name="startDate" type="datetime-local" defaultValue={formatDateTime(editingMeeting?.startDate)} required className="input-standard text-xs font-medium uppercase" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em]">End Date</label>
              <input name="endDate" type="datetime-local" defaultValue={formatDateTime(editingMeeting?.endDate)} required className="input-standard text-xs font-medium uppercase" />
            </div>
          </div>

          <div className="p-8 bg-slate-50/50 rounded-[12px] space-y-8 border border-slate-100 relative group/logic shadow-inner">
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-1.5 h-6 gradient-brand rounded-full shadow-sm" />
              <h4 className="text-[10px] font-bold text-navy-900 uppercase tracking-[0.3em]">Target Group</h4>
            </div>
            
            <div className="grid grid-cols-1 gap-8 relative z-10">
               <div className="space-y-2">
                <label className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Meeting Level</label>
                <select 
                  name="targetGroup" 
                  defaultValue={editingMeeting?.targetGroup || 'SECTOR'} 
                  onChange={(e) => setTargetGroup(e.target.value)}
                  className="input-standard py-4 font-semibold shadow-sm uppercase tracking-tight"
                >
                  <option value="SECTOR">SECTOR</option>
                  <option value="UNIT">UNIT</option>
                </select>
              </div>

              {targetGroup === 'UNIT' && (
                <FadeInUp className="space-y-2">
                  <label className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Select Unit</label>
                  <select name="assignedUnitId" defaultValue={editingMeeting?.assignedUnitId || 'ALL'} className="input-standard py-4 font-semibold shadow-sm uppercase tracking-tight">
                    <option value="ALL">ALL UNITS</option>
                    {sectors.flatMap(s => s.units).map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </FadeInUp>
              )}
            </div>
            <input type="hidden" name="assignedSectorId" value="ALL" />
          </div>

          <button type="submit" className="btn-primary w-full py-5 text-[11px] font-semibold uppercase tracking-[0.4em] shadow-2xl">
            {editingMeeting ? 'Save Changes' : 'Create Meeting'}
          </button>
        </form>
      </Drawer>
    </div>
  );
}
