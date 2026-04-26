'use client';

import { createUnit, deleteUnit } from '@/app/actions/unit';
import { useState } from 'react';
import Drawer from '@/components/Drawer';
import { Plus, Network, Target, Trash2, MapPin, Layers, ArrowRight } from 'lucide-react';
import { FadeInUp, ScaleIn, StaggerContainer } from '@/components/Animate';

export default function UnitsClient({ initialUnits, initialSectors = [] }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [filterSector, setFilterSector] = useState('ALL');

  const filteredUnits = initialUnits.filter(u => filterSector === 'ALL' || u.sectorId === filterSector);

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const res = await createUnit(formData);
    if (res?.error) setMsg(res.error);
    else {
      setMsg('Unit base established successfully!');
      e.target.reset();
      setIsDrawerOpen(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Permanently decommission this unit base?')) return;
    const res = await deleteUnit(id);
    if (res?.error) setMsg(res.error);
    else setMsg('Unit base decommissioned.');
  }

  return (
    <div className="space-y-10 pb-10">
      <FadeInUp className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-navy-900 uppercase leading-none">
            Unit <span className="text-brand-indigo">List</span>
          </h1>
          <p className="text-slate-500 font-normal text-sm md:text-base mt-2">Manage units and assign them to sectors.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <select 
            value={filterSector} 
            onChange={(e) => setFilterSector(e.target.value)}
            className="input-standard py-3 px-6 text-xs h-[52px] min-w-[200px] uppercase font-bold"
          >
            <option value="ALL">All Sectors</option>
            {initialSectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="btn-primary"
          >
            <Plus className="w-5 h-5 mr-1" />
            <span>Add New Unit</span>
          </button>
        </div>
      </FadeInUp>

      {msg && (
        <FadeInUp className={`p-4 rounded-[10px] border ${
          msg.includes('success') ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
        } text-xs font-bold text-center shadow-sm uppercase tracking-widest`}>
          {msg}
        </FadeInUp>
      )}

      {/* Grid - Elevated Cards */}
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {filteredUnits.length === 0 && (
          <FadeInUp className="col-span-full py-32 text-center card-premium border-dashed border-slate-200 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Network className="w-10 h-10 text-slate-200" />
            </div>
            <p className="text-slate-400 font-normal uppercase tracking-widest text-xs mb-8">No units found</p>
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="btn-secondary text-[10px] font-semibold uppercase tracking-widest"
            >
              Create First Unit
            </button>
          </FadeInUp>
        )}
        {filteredUnits.map((unit, idx) => (
          <ScaleIn key={unit.id} delay={idx * 0.05} className="card-premium flex flex-col group relative overflow-hidden h-full">
            <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="w-12 h-12 gradient-brand rounded-[12px] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <MapPin className="w-6 h-6 text-white" />
                </div>
                <button 
                  onClick={() => handleDelete(unit.id)}
                  className="p-3 bg-white rounded-lg text-slate-400 hover:text-rose-600 shadow-sm border border-slate-100 transition-all hover:scale-110"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
            </div>

            <div className="mb-10 relative z-10">
                <h3 className="text-2xl font-bold text-navy-900 tracking-tight group-hover:text-brand-indigo transition-colors leading-tight uppercase mb-2">{unit.name}</h3>
                <div className="flex items-center gap-2 text-[10px] font-medium text-brand-emerald uppercase tracking-widest leading-none">
                    <Target className="w-3.5 h-3.5" />
                    <span>Active Unit</span>
                </div>
            </div>

            <div className="mt-auto pt-8 border-t border-slate-50 space-y-4 relative z-10">
                <div className="p-4 bg-slate-50 rounded-[10px] border border-slate-100 flex items-center justify-between group-hover:bg-brand-light transition-colors">
                    <div className="flex items-center gap-3">
                        <Layers className="w-4 h-4 text-slate-300 group-hover:text-brand-indigo transition-colors" />
                        <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Sector</span>
                    </div>
                    <span className="text-[10px] font-semibold text-navy-900 uppercase tracking-widest">{unit.sector.name}</span>
                </div>
            </div>
            
            <div className="absolute -right-6 -bottom-6 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity transform group-hover:-rotate-12 duration-700">
                <Network className="w-32 h-32 text-navy-900" />
            </div>
          </ScaleIn>
        ))}
      </StaggerContainer>

      <Drawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        title="ADD NEW UNIT"
      >
        <form onSubmit={handleSubmit} className="space-y-8 py-2">
          <div className="space-y-2">
            <label className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.3em]">Unit Name</label>
            <input name="name" type="text" placeholder="e.g. Alpha Unit" required className="input-standard text-lg font-normal uppercase tracking-tight" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.3em]">Assign Sector</label>
            <select name="sectorId" required className="input-standard py-4 font-normal shadow-sm uppercase tracking-widest text-xs">
              <option value="">-- Choose Sector --</option>
              {initialSectors.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="p-8 bg-slate-50/50 rounded-[12px] space-y-4 border border-slate-100 relative group/info shadow-inner">
             <div className="flex gap-4 items-start relative z-10">
                 <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                    <Shield className="w-5 h-5 text-brand-indigo" />
                 </div>
                 <div>
                    <h4 className="text-[10px] font-bold text-navy-900 uppercase tracking-[0.3em] mb-2">Information</h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-normal">Adding a new unit will allow them to submit reports and earn marks.</p>
                 </div>
             </div>
          </div>

          <button type="submit" className="btn-primary w-full py-5 text-[11px] font-semibold uppercase tracking-[0.4em] shadow-2xl">
            Add Unit
          </button>
        </form>
      </Drawer>
    </div>
  );
}

function Shield({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>
    </svg>
  );
}
