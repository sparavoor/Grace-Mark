'use client';

import { createSector, deleteSector } from '@/app/actions/sector';
import { useState } from 'react';
import Drawer from '@/components/Drawer';
import { Plus, Users, Shield, Target, Trash2, ArrowRight, ExternalLink } from 'lucide-react';
import { FadeInUp, ScaleIn, StaggerContainer } from '@/components/Animate';
import Link from 'next/link';

export default function SectorsClient({ initialSectors }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [msg, setMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const res = await createSector(formData);
    if (res?.error) setMsg(res.error);
    else {
      setMsg('Sector node established successfully!');
      e.target.reset();
      setIsDrawerOpen(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('This will permanently decommission this sector node. Proceed?')) return;
    const res = await deleteSector(id);
    if (res?.error) setMsg(res.error);
    else setMsg('Sector node decommissioned.');
  }

  return (
    <div className="space-y-10 pb-10">
      <FadeInUp className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-navy-900 uppercase leading-none">
            Sector <span className="text-brand-indigo">Network</span>
          </h1>
          <p className="text-slate-500 font-normal text-sm md:text-base mt-2">Manage primary organizational nodes and administrative access.</p>
        </div>
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="btn-primary"
        >
          <Plus className="w-5 h-5 mr-1" />
          <span>Provision Sector Node</span>
        </button>
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
        {initialSectors.length === 0 && (
          <FadeInUp className="col-span-full py-32 text-center card-premium border-dashed border-slate-200 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Shield className="w-10 h-10 text-slate-200" />
            </div>
            <p className="text-slate-400 font-normal uppercase tracking-widest text-xs mb-8">No active sector nodes discovered</p>
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="btn-secondary text-[10px] font-semibold uppercase tracking-widest"
            >
              Initialize Network Node
            </button>
          </FadeInUp>
        )}
        {initialSectors.map((sector, idx) => (
          <ScaleIn key={sector.id} delay={idx * 0.05} className="card-premium flex flex-col group relative overflow-hidden h-full">
            <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="w-12 h-12 gradient-brand rounded-[12px] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Shield className="w-6 h-6 text-white" />
                </div>
                <button 
                  onClick={() => handleDelete(sector.id)}
                  className="p-3 bg-white rounded-lg text-slate-400 hover:text-rose-600 shadow-sm border border-slate-100 transition-all hover:scale-110"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
            </div>

            <div className="mb-10 relative z-10">
                <h3 className="text-2xl font-bold text-navy-900 tracking-tight group-hover:text-brand-indigo transition-colors leading-tight uppercase mb-2">{sector.name}</h3>
                <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-none">
                    <Target className="w-3.5 h-3.5 text-brand-emerald" />
                    <span>Active Domain Node</span>
                </div>
            </div>

            <div className="mt-auto pt-8 border-t border-slate-50 space-y-4 relative z-10">
                <div className="flex justify-between items-center text-[10px] font-medium uppercase tracking-widest">
                    <span className="text-slate-400">Security Cipher</span>
                    <span className="text-navy-900 font-semibold">ADMINISTRATOR</span>
                </div>
                
                <Link 
                  href={`/admin/sectors/${sector.id}`}
                  className="btn-primary w-full text-[10px] uppercase tracking-[0.3em] py-4 group/btn"
                >
                  Node Insight <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
            </div>
            
            <div className="absolute -right-6 -bottom-6 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity transform group-hover:rotate-12 duration-700">
                <Users className="w-32 h-32 text-navy-900" />
            </div>
          </ScaleIn>
        ))}
      </StaggerContainer>

      <Drawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        title="NODE PROVISIONING"
      >
        <form onSubmit={handleSubmit} className="space-y-8 py-2">
          <div className="space-y-2">
            <label className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.3em]">Sector Designation</label>
            <input name="name" type="text" placeholder="e.g. Northern Division" required className="input-standard text-lg font-normal uppercase tracking-tight" />
          </div>

          <div className="p-8 bg-slate-50/50 rounded-[12px] space-y-8 border border-slate-100 relative group/security shadow-inner">
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-1.5 h-6 gradient-brand rounded-full shadow-sm" />
              <h4 className="text-[10px] font-bold text-navy-900 uppercase tracking-[0.3em]">Access Encryption</h4>
            </div>
            
            <div className="grid grid-cols-1 gap-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Node Identifier (Username)</label>
                <input name="username" type="text" placeholder="sector_name" required className="input-standard py-4 font-normal shadow-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Activation Code (Password)</label>
                <input name="password" type="password" placeholder="••••••••" required className="input-standard py-4 font-normal shadow-sm" />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-5 text-[11px] font-semibold uppercase tracking-[0.4em] shadow-2xl">
            Authorize & Establish Node
          </button>
        </form>
      </Drawer>
    </div>
  );
}
