'use client';

import { useState } from 'react';
import { FileText, Users, Calendar, ExternalLink, ImageIcon, Target, Search, X, Filter } from 'lucide-react';
import { FadeInUp, ScaleIn, StaggerContainer } from '@/components/Animate';

export default function ReportsClient({ initialReports, sectors, units, meetings }) {
  const [filterSector, setFilterSector] = useState('ALL');
  const [filterUnit, setFilterUnit] = useState('ALL');
  const [filterMeeting, setFilterMeeting] = useState('ALL');

  const filteredReports = initialReports.filter(r => {
    const sectorMatch = filterSector === 'ALL' || r.sectorId === filterSector;
    const unitMatch = filterUnit === 'ALL' || r.unitId === filterUnit;
    const meetingMatch = filterMeeting === 'ALL' || r.meetingId === filterMeeting;
    return sectorMatch && unitMatch && meetingMatch;
  });

  const resetFilters = () => {
    setFilterSector('ALL');
    setFilterUnit('ALL');
    setFilterMeeting('ALL');
  };

  return (
    <div className="space-y-10">
      {/* Search & Filter Bar */}
      <FadeInUp className="card-premium p-6 border-slate-100 shadow-xl overflow-visible">
        <div className="flex flex-col md:flex-row items-end gap-6">
          <div className="flex-1 w-full space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Filter className="w-3 h-3" /> Filter by Sector
            </label>
            <select 
              value={filterSector} 
              onChange={(e) => { setFilterSector(e.target.value); setFilterUnit('ALL'); }}
              className="input-standard py-3 text-xs uppercase font-semibold"
            >
              <option value="ALL">All Sectors</option>
              {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="flex-1 w-full space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filter by Unit</label>
            <select 
              value={filterUnit} 
              onChange={(e) => setFilterUnit(e.target.value)}
              className="input-standard py-3 text-xs uppercase font-semibold disabled:opacity-50"
              disabled={filterSector === 'ALL'}
            >
              <option value="ALL">All Units</option>
              {units
                .filter(u => filterSector === 'ALL' || u.sectorId === filterSector)
                .map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>

          <div className="flex-1 w-full space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filter by Meeting</label>
            <select 
              value={filterMeeting} 
              onChange={(e) => setFilterMeeting(e.target.value)}
              className="input-standard py-3 text-xs uppercase font-semibold"
            >
              <option value="ALL">All Meetings</option>
              {meetings.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>

          <button 
            onClick={resetFilters}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-[10px] text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <X className="w-4 h-4" /> Reset
          </button>
        </div>
      </FadeInUp>

      {/* Desktop View - Premium Table */}
      <FadeInUp delay={0.1} className="hidden lg:block glass-card overflow-hidden p-0 border-slate-100 shadow-2xl">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Meeting Name</th>
                <th className="px-8 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Sector / Unit</th>
                <th className="px-8 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap text-center">Attendance</th>
                <th className="px-8 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap text-center">Date</th>
                <th className="px-8 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap text-right">View Photo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-8 py-32 text-center font-normal text-slate-400">
                    <div className="flex flex-col items-center gap-6">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                        <FileText className="w-10 h-10 opacity-20" />
                      </div>
                      <span className="text-sm font-medium uppercase tracking-widest">No reports matching your criteria...</span>
                    </div>
                  </td>
                </tr>
              )}
              {filteredReports.map((r) => (
                <tr key={r.id} className="group hover:bg-indigo-50/30 transition-all duration-300">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-1.5 h-12 rounded-full shadow-sm ${r.meeting.targetGroup === 'SECTOR' ? 'bg-indigo-600' : 'bg-amber-400'}`} />
                      <div>
                        <p className="font-bold text-slate-900 leading-tight tracking-tight text-lg group-hover:text-indigo-600 transition-colors uppercase">{r.meeting.name}</p>
                        <span className={`text-[9px] font-medium uppercase tracking-[0.15em] mt-1 inline-block ${r.meeting.targetGroup === 'SECTOR' ? 'text-indigo-500' : 'text-amber-600'}`}>
                          {r.meeting.targetGroup} Level
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {r.unit ? (
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900 tracking-tight uppercase text-sm">{r.unit.name}</p>
                        <div className="flex items-center gap-1.5 text-[9px] font-medium text-slate-400 uppercase tracking-widest">
                          <Target className="w-3 h-3 text-indigo-400" />
                          <span>via {r.sector.name}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-xl">
                            <Users className="w-4 h-4 text-indigo-600 shadow-sm" />
                        </div>
                        <span className="font-semibold text-indigo-600 tracking-tight uppercase text-xs">{r.sector.name}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="inline-flex flex-col items-center px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl group-hover:bg-white group-hover:shadow-lg transition-all">
                      <span className="text-lg font-semibold text-slate-900 leading-none">{r.attendanceCount}</span>
                      <span className="text-[8px] font-medium text-slate-400 uppercase mt-1">Attendance</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col items-center gap-1 text-[10px] font-medium text-slate-500 uppercase tracking-tighter">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-300" />
                        {new Date(r.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                      <span className="text-[8px] text-slate-300">{new Date(r.submittedAt).getFullYear()}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3 items-center">
                      <a 
                        href={r.minutesImagePath} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="p-3 bg-slate-900 rounded-2xl text-white hover:bg-indigo-600 hover:shadow-2xl hover:shadow-indigo-600/30 transition-all group/btn"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </a>
                      <div className="flex flex-col items-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <a 
                            href={r.minutesImagePath} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-[9px] font-semibold uppercase tracking-[0.2em] text-indigo-600 hover:underline flex items-center gap-1.5"
                        >
                            View Photo <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FadeInUp>

      {/* Mobile/Tablet View */}
      <StaggerContainer className="lg:hidden space-y-4">
        {filteredReports.length === 0 && (
          <FadeInUp className="glass-card py-24 text-center border-dashed border-slate-200">
             <p className="text-slate-400 font-normal uppercase tracking-widest text-xs">No reports matching filters</p>
          </FadeInUp>
        )}
        {filteredReports.map((r, idx) => (
          <ScaleIn key={r.id} delay={idx * 0.05} className="glass-card p-6 md:p-8 border-slate-100 group relative">
             <div className="flex justify-between items-start mb-6">
                <div>
                   <h3 className="text-lg font-bold text-slate-900 uppercase">{r.meeting.name}</h3>
                   <p className="text-[9px] font-medium text-indigo-500 uppercase mt-1">{r.meeting.targetGroup} Level</p>
                </div>
                <a href={r.minutesImagePath} target="_blank" rel="noreferrer" className="p-4 bg-slate-900 text-white rounded-2xl">
                   <ImageIcon className="w-5 h-5" />
                </a>
             </div>
             <div className="p-4 bg-slate-50 rounded-2xl mb-6">
                <p className="text-[9px] text-slate-400 uppercase mb-1">Source</p>
                <p className="text-sm font-bold text-slate-900 uppercase">{r.unit ? r.unit.name : r.sector.name}</p>
             </div>
             <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-3">
                   <Users className="w-4 h-4 text-indigo-600" />
                   <span className="text-sm font-semibold">{r.attendanceCount} Personnel</span>
                </div>
                <div className="flex items-center gap-3 justify-end text-slate-400">
                   <Calendar className="w-4 h-4" />
                   <span className="text-xs uppercase">{new Date(r.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
             </div>
          </ScaleIn>
        ))}
      </StaggerContainer>
    </div>
  );
}
