'use client';

import { login } from '@/app/actions/auth';
import { useState } from 'react';
import { Trophy, ShieldCheck, ArrowRight } from 'lucide-react';
import { FadeInUp } from '@/components/Animate';

export default function LoginClient() {
  const [error, setError] = useState();

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const res = await login(formData);
    if (res?.error) setError(res.error);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        <FadeInUp className="text-center mb-12 space-y-4">
          <div className="w-16 h-16 gradient-brand rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/20 rotate-3">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tighter text-navy-900 uppercase">Grace Mark<span className="text-indigo-600">.</span></h1>
            <p className="text-slate-400 font-medium uppercase text-[9px] tracking-[0.3em]">Pulikkal Division Portal</p>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.1} className="card-premium p-8 md:p-12 border-slate-200/60 shadow-2xl">
          {error && (
            <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-[10px] text-rose-600 text-[10px] font-bold uppercase tracking-widest text-center animate-fade-in">
              Access Denied: {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.3em]">Username</label>
              <input 
                name="username" 
                type="text" 
                placeholder="Enter your username" 
                required 
                className="input-standard py-4 font-normal shadow-inner"
              />
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.3em]">Password</label>
              <input 
                name="password" 
                type="password" 
                placeholder="••••••••" 
                required 
                className="input-standard py-4 font-normal shadow-inner"
              />
            </div>

            <button type="submit" className="btn-primary w-full py-5 text-[11px] font-semibold uppercase tracking-[0.4em] shadow-2xl group text-white">
              Login <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          
          <div className="mt-14 pt-8 border-t border-slate-50 text-center flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-[9px] font-medium text-slate-300 uppercase tracking-widest leading-none">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Secure Access Portal</span>
            </div>
            <p className="text-[8px] text-slate-300 font-normal uppercase tracking-[0.2em]">
              &copy; 2026 SSF Pulikkal Division
            </p>
          </div>
        </FadeInUp>
      </div>
    </div>
  );
}
