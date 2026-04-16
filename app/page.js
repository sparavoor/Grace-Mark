import Link from 'next/link';
import { Shield, Users, LayoutDashboard, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center p-6 animate-fade-in overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-slate-blue/5 rounded-full blur-3xl -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-navy-900/5 rounded-full blur-3xl -ml-20 -mb-20" />

      <div className="w-full max-w-4xl relative z-10">
        <div className="text-center space-y-4 mb-20 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-navy-900 rounded-full text-[10px] font-semibold uppercase text-white tracking-[0.3em] mb-4 shadow-xl shadow-navy-900/20">
            <LayoutDashboard className="w-3 h-3 text-slate-blue" />
            V4.0 Enterprise
          </div>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-navy-900 leading-none">
            Grace Mark<span className="text-slate-blue opacity-50">.</span>
          </h1>
          <p className="max-w-xl mx-auto text-gray-500 font-normal md:text-xl md:leading-relaxed">
            Revolutionizing performance tracking and organizational impact through automated scoring and real-time audit logs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Admin Entry */}
          <Link href="/login" className="group">
            <div className="card-premium p-10 h-full border-2 border-transparent transition-all hover:border-slate-blue/20 hover:shadow-2xl hover:shadow-slate-blue/10 relative overflow-hidden flex flex-col items-center text-center">
              <div className="p-5 bg-navy-900 rounded-3xl mb-8 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-navy-900 mb-2">Division Access</h2>
              <p className="text-gray-400 text-sm font-normal mb-8 max-w-[200px]">
                Manage sectors, schedule meetings, and audit global performance metrics.
              </p>
              <div className="mt-auto flex items-center gap-2 text-slate-blue font-semibold uppercase text-[10px] tracking-widest group-hover:gap-4 transition-all uppercase">
                Enter Dashboard <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </Link>

          {/* Sector Entry */}
          <Link href="/login" className="group">
            <div className="card-premium p-10 h-full border-2 border-transparent transition-all hover:border-navy-900/10 hover:shadow-2xl hover:shadow-navy-900/5 relative overflow-hidden flex flex-col items-center text-center bg-white">
              <div className="p-5 bg-slate-blue rounded-3xl mb-8 group-hover:scale-110 transition-transform shadow-lg shadow-slate-blue/20">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-navy-900 mb-2">Sector Portal</h2>
              <p className="text-gray-400 text-sm font-normal mb-8 max-w-[200px]">
                Submit reports, track mark progress, and manage unit-level results.
              </p>
              <div className="mt-auto flex items-center gap-2 text-navy-900 font-semibold uppercase text-[10px] tracking-widest group-hover:gap-4 transition-all uppercase">
                Submit Report <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-20 pt-10 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
          <p className="text-[10px] font-medium uppercase text-gray-300 tracking-widest">
            &copy; 2026 SSF Pulikkal Division. All rights reserved.
          </p>
          <div className="flex gap-8">
            <span className="text-[10px] font-bold text-gray-300 uppercase">System Status: Online</span>
            <span className="text-[10px] font-bold text-gray-300 uppercase">Latency: 12ms</span>
          </div>
        </div>
      </div>
    </main>
  );
}
