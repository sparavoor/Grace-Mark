import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Calendar, FileText, Trophy, LogOut, ShieldCheck } from 'lucide-react';

export default async function SectorLayout({ children }) {
  const session = await getSession();
  if (!session || session.role !== 'SECTOR') redirect('/login');

  const navItems = [
    { name: 'Overview', href: '/sector/dashboard', icon: LayoutDashboard },
    { name: 'Submit Report', href: '/sector/report', icon: FileText },
    { name: 'Submissions', href: '/sector/history', icon: Calendar },
    { name: 'Scorecard', href: '/sector/scorecard', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Desktop Sidebar - Solid Dark Navy */}
      <aside className="hidden md:flex w-72 bg-navy-900 text-white flex-col sticky top-0 h-screen shadow-2xl z-50">
        <div className="p-8 pb-12">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tighter uppercase">Sector<span className="text-indigo-400 font-bold">Portal</span></span>
          </div>
        </div>
        
        <nav className="flex-grow px-4 space-y-1">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className="flex items-center gap-4 px-5 py-4 rounded-[10px] transition-all text-slate-400 hover:text-white hover:bg-white/5 font-medium group"
            >
              <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="tracking-tight text-sm uppercase font-semibold tracking-widest leading-none">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-6 mt-auto border-t border-white/5 bg-navy-950/30">
          <form action="/login" method="POST">
            <button type="submit" className="flex items-center gap-4 px-5 py-4 rounded-[10px] w-full text-rose-400 hover:bg-rose-500/10 transition-all font-semibold text-xs uppercase tracking-widest group">
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Identity Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content & Mobile View */}
      <div className="flex-grow flex flex-col min-w-0 h-screen">
        {/* Mobile Top Header - Clean Light */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold tracking-tighter text-xs text-navy-900 uppercase leading-none">Sector Hub.</span>
          </div>
          <form action="/login" method="POST">
            <button type="submit" className="text-slate-400 hover:text-navy-900 p-2">
              <LogOut className="w-4 h-4 text-slate-400" />
            </button>
          </form>
        </header>

        {/* Action-focused Main Content */}
        <main className="flex-grow p-4 md:p-12 pb-36 md:pb-12 overflow-y-auto relative animate-fade-in no-scrollbar">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation - Centered & Premium Navy */}
      <div className="md:hidden handle-safe-area fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] z-50">
        <nav className="bg-navy-900 border border-white/10 rounded-[2rem] shadow-2xl flex justify-around items-center p-3">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className="group flex flex-col items-center justify-center p-2 relative active:scale-90 transition-transform"
            >
              <item.icon className="w-6 h-6 text-slate-500 group-hover:text-white transition-colors" />
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
