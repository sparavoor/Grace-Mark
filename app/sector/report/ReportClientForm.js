'use client';

import { submitReport } from '@/app/actions/meeting';
import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, CheckCircle2, Info, Edit2, ArrowRight } from 'lucide-react';
import { FadeInUp } from '@/components/Animate';

export default function ReportClientForm({ activeMeetings, units }) {
  const [msg, setMsg] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('SECTOR');
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);

  const availableMeetings = activeMeetings.filter(m => m.targetGroup === selectedGroup);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setMsg('');
    try {
      const formData = new FormData(e.target);
      const res = await submitReport(formData);
      if (res?.error) setMsg(res.error);
      else {
        setMsg('Report submitted successfully!');
        setPreview(null);
        e.target.reset();
      }
    } catch (err) {
      setMsg('A connection error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-10">
      <FadeInUp className="text-center space-y-3 pb-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-navy-900 uppercase leading-none">
          {selectedGroup === 'SECTOR' ? 'Sector' : 'Unit'} <span className="text-brand-indigo">Report</span>
        </h1>
        <p className="text-slate-500 font-normal text-sm md:text-base">Submit your report to get your marks.</p>
      </FadeInUp>

      <div className="card-premium">
        {msg && (
          <FadeInUp className={`mb-10 p-5 rounded-[10px] border flex items-center gap-4 ${
            msg.includes('success') ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
          } shadow-sm`}>
            {msg.includes('success') ? <CheckCircle2 className="w-5 h-5" /> : <Info className="w-5 h-5" />}
            <span className="font-bold text-xs uppercase tracking-widest">{msg}</span>
          </FadeInUp>
        )}

        {/* Professional Tab Selection */}
        <div className="flex p-1.5 bg-slate-100 rounded-[12px] mb-10 border border-slate-200 shadow-inner">
          <button 
            onClick={() => setSelectedGroup('SECTOR')}
            className={`flex-1 py-3.5 px-6 rounded-[10px] font-semibold text-xs uppercase tracking-[0.2em] transition-all ${
              selectedGroup === 'SECTOR' ? 'bg-navy-900 text-white shadow-xl' : 'text-slate-500 hover:text-navy-900'
            }`}
          >
            Sector Report
          </button>
          <button 
            onClick={() => setSelectedGroup('UNIT')}
            className={`flex-1 py-3.5 px-6 rounded-[10px] font-semibold text-xs uppercase tracking-[0.2em] transition-all ${
              selectedGroup === 'UNIT' ? 'bg-navy-900 text-white shadow-xl' : 'text-slate-500 hover:text-navy-900'
            }`}
          >
            Unit Report
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.3em]">Select Meeting</label>
              <select name="meetingId" required className="input-standard py-4 font-normal shadow-sm uppercase tracking-widest text-xs">
                <option value="">-- Choose Meeting --</option>
                {availableMeetings.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              {availableMeetings.length === 0 && (
                <div className="flex items-center gap-2 mt-3 text-rose-500 text-[10px] font-medium uppercase tracking-widest">
                  <Info className="w-3.5 h-3.5" />
                  <span>No active meetings found</span>
                </div>
              )}
            </div>

            {selectedGroup === 'UNIT' ? (
              <div className="space-y-3 animate-fade-in">
                <label className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.3em]">Select Unit</label>
                <select name="unitId" required className="input-standard py-4 font-normal shadow-sm uppercase tracking-widest text-xs">
                  <option value="">-- Choose Unit --</option>
                  {units.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.3em]">Type</label>
                <div className="input-standard py-4 bg-slate-50 flex items-center font-medium text-slate-400 text-xs opacity-80 uppercase tracking-widest border-dashed">
                  Sector Level Report
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.3em]">Attendance</label>
              <input 
                name="attendanceCount" 
                type="number" 
                min="1" 
                placeholder="Total attendance" 
                required 
                className="input-standard py-4 font-normal shadow-sm"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.3em]">Place / Venue</label>
              <input 
                name="venue" 
                type="text" 
                placeholder="e.g. Sector Office" 
                required 
                className="input-standard py-4 font-normal shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.3em]">Representative Name</label>
            <input 
              name="representativeName" 
              type="text" 
              placeholder="Enter name" 
              required 
              className="input-standard py-4 font-normal shadow-sm"
            />
          </div>

          {/* Premium Performance Capture */}
          <div className="space-y-4">
            <label className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.3em]">
              Upload Minutes Photo
            </label>
            
            {!preview ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-[12px] p-12 flex flex-col items-center justify-center gap-6 transition-all hover:border-brand-indigo hover:bg-brand-light cursor-pointer group shadow-inner"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:shadow-lg transition-all">
                  <Upload className="w-8 h-8 text-slate-300 group-hover:text-brand-indigo transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-navy-900 uppercase tracking-tight">Select Photo from Gallery</p>
                  <p className="text-[9px] text-slate-400 mt-2 uppercase font-medium tracking-[0.2em]">JPG or PNG (Max 5MB)</p>
                </div>
              </div>
            ) : (
              <div className="relative rounded-[12px] overflow-hidden aspect-video border border-slate-200 shadow-2xl group ring-4 ring-white">
                <img src={preview} alt="Manifest preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-navy-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 bg-white rounded-xl text-navy-900 shadow-2xl hover:scale-110 transition-transform"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button 
                    type="button"
                    onClick={removeFile}
                    className="p-4 bg-rose-500 rounded-xl text-white shadow-2xl hover:scale-110 transition-transform"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
            
            <input 
              ref={fileInputRef}
              name="photo" 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              required 
              className="hidden" 
            />
          </div>

          <div className="pt-10 border-t border-slate-100">
            <button 
              type="submit" 
              disabled={isLoading}
              className="btn-primary w-full py-6 text-[12px] font-semibold uppercase tracking-[0.4em] shadow-2xl group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Submitting Report...' : 'Submit Report'} 
              {!isLoading && <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />}
            </button>
            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="w-2 h-2 bg-brand-emerald rounded-full animate-pulse" />
              <p className="text-[9px] text-slate-400 uppercase font-normal tracking-widest">
                Submitted reports will be verified by the Division.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
